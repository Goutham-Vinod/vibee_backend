import mongoose from "mongoose"
import callModel from "../model/Call.js"
import conversationModel from "../model/Conversations.js"
import notificationModel from "../model/Notifications.js"

export const createVideoCall = async (req, res) => {
  try {
    const { conversationId } = req.body
    const { id } = req.user
    const conversation = await conversationModel.findById(conversationId)
    if (!conversation)
      return res.status(400).json({ message: "Invalid conversation id" })
    if (!conversation.users.includes(new mongoose.Types.ObjectId(id)))
      return res.status(401).json({ message: "User not part of conversation" })
    if (conversation.isGroupChat)
      return res
        .status(400)
        .json({ message: "Group call feature is coming soon" })

    const to = conversation.users.find((item) => item._id.toString() !== id)
    console.log(to)
    const call = new callModel({
      from: id,
      to: to._id,
      isVideoCall: true,
      conversationId,
    })
    await call.save()
    await call.populate({ path: "from", select: "-password" })
    await call.populate({ path: "to", select: "-password" })
    res.json(call)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params
    const { id } = req.user
    const call = await callModel.findById(callId)
    if (call.from.toString() !== id && call.to.toString() !== id) {
      return res.status(403).json({ message: "Not authorized" })
    }
    res.json(call)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const createLiveStream = async (req, res) => {
  try {
    const { id } = req.user
    const live = new callModel({
      from: id,
      isLive: true,
    })
    await live.save()
    const notification = new notificationModel({
      type: "live",
      userId: id,
      roomId: live._id,
    })
    await notification.save()
    await notification.populate({ path: "userId", select: "-password" })
    res.json({ live, notification })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const getLiveDetails = async (req, res) => {
  try {
    const { roomId } = req.params
    const live = await callModel.findById(roomId)
    res.json(live)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}
