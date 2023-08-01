import paymentModel from "../model/Payment.js"
import userModel from "../model/User.js"

export const getUnverifiedSubscriptions = async () => {
  try {
    const users = await userModel.aggregate([
      {
        $match: {
          $or: [
            {
              subscriptionStatus: {
                $ne: "inactive",
              },
            },
            {
              eliteVerified: {
                $exists: true,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "userId",
          pipeline: [
            {
              $match: {
                refundId: {
                  $exists: false,
                },
                isDeleted: false,
              },
            },
          ],
          as: "payment",
        },
      },
      {
        $unwind: {
          path: "$payment",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          password: 0,
          friends: 0,
          blockedUsers: 0,
        },
      },
    ])
    return users
  } catch (error) {
    throw error
  }
}
