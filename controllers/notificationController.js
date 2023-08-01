import mongoose from "mongoose"
import notificationModel from "../model/Notifications.js"
import {
  getAllNotifications,
  getTotalNotificationCount,
  getUnreadNotifications,
} from "../helpers/notificationHelper.js"

export const getNotifications = async (req, res) => {
  try {
    const { id } = req.user
    let skip = req.query.skip || 0
    skip *= 20
    console.log(skip)
    const notifications = await getAllNotifications(id, skip)
    const totalNotifications = await getTotalNotificationCount(id)
    const unread = await getUnreadNotifications(id)
    const readByCount = unread.length
    const totalCount = totalNotifications.length
    return res.json({ notifications, totalCount, readByCount })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const setReadNotifications = async (req, res) => {
  try {
    const { id } = req.user
    const notifications = await getUnreadNotifications(id)
    for (let item of notifications) {
      await notificationModel.findOneAndUpdate(item._id, {
        $push: { readBy: id },
      })
    }
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}
