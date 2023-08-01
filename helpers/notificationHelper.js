import mongoose from "mongoose"
import notificationModel from "../model/Notifications.js"

export const getAllNotifications = async (id, skip) => {
  try {
    const notifications = await notificationModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "to",
        },
      },
      {
        $unwind: {
          path: "$to",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "postId",
        },
      },
      {
        $unwind: {
          path: "$postId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { "userId.friends": new mongoose.Types.ObjectId(id) },
                { type: "create" },
              ],
            },
            {
              $and: [
                { "to._id": new mongoose.Types.ObjectId(id) },
                { type: { $ne: "create" } },
              ],
            },
            {
              $and: [
                { "postId.createdBy": new mongoose.Types.ObjectId(id) },
                { "userId._id": { $ne: new mongoose.Types.ObjectId(id) } },
              ],
            },
            {
              $and: [
                { "userId.friends": new mongoose.Types.ObjectId(id) },
                { type: "live" },
              ],
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: 20,
      },
    ])
    return notifications
  } catch (error) {
    throw error
  }
}

export const getTotalNotificationCount = async (id) => {
  try {
    const totalNotifications = await notificationModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "to",
        },
      },
      {
        $unwind: {
          path: "$to",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "postId",
        },
      },
      {
        $unwind: {
          path: "$postId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { "userId.friends": new mongoose.Types.ObjectId(id) },
                { type: "create" },
              ],
            },
            {
              $and: [
                { "to._id": new mongoose.Types.ObjectId(id) },
                { type: { $ne: "create" } },
              ],
            },
            {
              $and: [
                { "postId.createdBy": new mongoose.Types.ObjectId(id) },
                { "userId._id": { $ne: new mongoose.Types.ObjectId(id) } },
              ],
            },
          ],
        },
      },
    ])
    return totalNotifications
  } catch (error) {
    throw error
  }
}

export const getUnreadNotifications = async (id) => {
  try {
    const unreadNotifications = await notificationModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "to",
        },
      },
      {
        $unwind: {
          path: "$to",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "postId",
        },
      },
      {
        $unwind: {
          path: "$postId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { "userId.friends": new mongoose.Types.ObjectId(id) },
                { type: "create" },
              ],
            },
            {
              $and: [
                { "to._id": new mongoose.Types.ObjectId(id) },
                { type: { $ne: "create" } },
              ],
            },
            {
              $and: [
                { "postId.createdBy": new mongoose.Types.ObjectId(id) },
                { "userId._id": { $ne: new mongoose.Types.ObjectId(id) } },
              ],
            },
          ],
        },
      },
      {
        $match: {
          readBy: {
            $nin: [new mongoose.Types.ObjectId(id)],
          },
        },
      },
    ])
    return unreadNotifications
  } catch (error) {
    throw error
  }
}
