import Stripe from "stripe"
import userModel from "../model/User.js"
import paymentModel from "../model/Payment.js"
import notificationModel from "../model/Notifications.js"
import { getUnverifiedSubscriptions } from "../helpers/paymentHelper.js"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const initiatePayment = async (req, res) => {
  try {
    const { id } = req.user
    const user = await userModel.findById(id)
    const { paymentMethod } = req.body
    const customer = await stripe.customers.create({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    })
    const startDate = new Date(0)
    startDate.setUTCSeconds(subscription.current_period_start)
    const endDate = new Date(0)
    endDate.setUTCSeconds(subscription.current_period_end)
    const existingPayment = await paymentModel.findOne({ userId: id })
    if (existingPayment) {
      existingPayment.isDeleted = true
      await existingPayment.save()
    }
    const payment = new paymentModel({
      userId: id,
      subscriptionId: subscription.id,
      startDate,
      endDate,
      customerId: subscription.customer,
      status: subscription.status,
      paymentIntent: subscription.latest_invoice.payment_intent.id,
    })
    await payment.save()
    console.log(subscription.latest_invoice.payment_intent.client_secret)
    console.log(subscription)
    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    })
  } catch (error) {
    console.log(error)
  }
}

export const getSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.user
    const { paymentIntent } = req.params
    const payment = await paymentModel.findOne({ paymentIntent })
    if (!payment)
      return res.status(400).json({ message: "Invalid payment intent id" })
    const subscription = await stripe.subscriptions.retrieve(
      payment.subscriptionId
    )
    const user = await userModel.findById(id)
    user.eliteVerified = "pending"
    await user.save()
    payment.status = subscription.status
    await payment.save()
    if (subscription.status === "active") {
      return res.json({ subscription: true })
    }
  } catch (error) {
    console.log(error)
  }
}

export const getAllUnverifiedSubscriptions = async (req, res) => {
  try {
    const users = await getUnverifiedSubscriptions()
    console.log(users)
    res.json(users)
  } catch (error) {
    console.log(error)
  }
}

export const confirmSubscription = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId)
    if (!user) return res.status(400).json({ message: "Invalid user id" })
    user.subscriptionStatus = "active"
    user.elite = true
    user.eliteVerified = "verified"
    await user.save()
    const users = await getUnverifiedSubscriptions()
    res.json(users)
  } catch (error) {
    console.log(error)
  }
}

export const denySubscription = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId)
    if (!user) return res.status(400).json({ message: "Invalid user id" })
    user.subscriptionStatus = "inactive"
    user.elite = false
    user.eliteVerified = "rejected"
    const payment = await paymentModel.findOne({
      userId,
      isDeleted: false,
      refundId: { $exists: false },
    })
    const subscription = await stripe.subscriptions.cancel(
      payment.subscriptionId
    )
    payment.status = "canceled"
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntent,
    })
    payment.refundId = refund.id
    await payment.save()
    await user.save()
    const users = await getUnverifiedSubscriptions()
    res.json(users)
  } catch (error) {
    console.log(error)
  }
}

export const getSubscriptionDetails = async (req, res) => {
  try {
    const { id } = req.user
    const payment = await paymentModel.findOne({
      userId: id,
      isDeleted: false,
      refundId: { $exists: false },
    })
    res.json(payment)
  } catch (error) {
    console.log(error)
  }
}

export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.user
    const { paymentId } = req.body
    console.log(req.body)
    const payment = await paymentModel.findById(paymentId)
    if (payment.userId.toString() !== id)
      return res
        .status(403)
        .json({ message: "User is not authorized to cancel this subscription" })
    const subscription = await stripe.subscriptions.cancel(
      payment.subscriptionId
    )
    payment.status = subscription.status
    await payment.save()
    return res.json(payment)
  } catch (error) {
    console.log(error)
  }
}

export const handleWebHooks = async (req, res) => {
  console.log("in handle")
  const sig = req.headers["stripe-signature"]
  let event
  const payload = req.body
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_ENDPOINT_SECRET
    )
  } catch (error) {
    console.log(error)
    res.status(400).send(`webhook Error: ${error.message}`)
    return
  }
  switch (event.type) {
    case "invoice.created":
      const invoice = event.data.object
      // console.log(invoice)
      const customerId = invoice.customer
      console.log(customerId)
      const payment = await paymentModel.findOne({ customerId })
      if (payment) {
        const { userId } = payment
        const user = await userModel.findById(userId)
        const notification = new notificationModel({
          type: "payment",
          userId,
        })
        await notification.save()
      }
      // console.log(invoice)
      break

    case "invoice.paid":
      const invoice1 = event.data.object
      const cusId = invoice.customer
      const paymentDoc = await paymentModel.findOne({ cusId })
      if (paymentDoc) {
        paymentDoc.startDate = new Date()
        paymentDoc.endDate = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          new Date().getDate()
        )
        await paymentDoc.save()
      }
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  res.send()
}

export const getPaymentDetails = async (req, res) => {
  try {
    const payments = await paymentModel
      .find()
      .populate({ path: "userId", select: "-password" })
    console.log(payments)
    return res.json(payments)
  } catch (error) {
    console.log(error)
  }
}

export const cancelRejection = async (req, res) => {
  console.log("here")
  try {
    const { userId } = req.body
    console.log(userId)
    const user = await userModel.findById(userId)
    if (!user) return res.status(400).json({ message: "Invalid user id" })
    await userModel.findByIdAndUpdate(userId, { $unset: { eliteVerified: "" } })
    const users = await getUnverifiedSubscriptions()
    console.log(users)
    return res.json(users)
  } catch (error) {
    console.log(error)
  }
}
