import mongoose from "mongoose"
import notificationModel from "../model/Notifications.js"
import postModel from "../model/Posts.js"
import userModel from "../model/User.js"
import onlineUserModel from "../model/OnlineUsers.js"

export const getAllNotifications = async (userId) => {
  try {
    const notifications = await notificationModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      password: 0,
                    },
                  },
                ],
                as: "createdBy",
              },
            },
            {
              $unwind: "$createdBy",
            },
          ],
          as: "postId",
        },
      },
      {
        $unwind: "$postId",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
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
          as: "to",
        },
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    return notifications
  } catch (error) {
    throw error
  }
}

export const getPostOfOneMonth = async (year, month) => {
  try {
    console.log(year, month)
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 1)
    const dateFormat = "%Y-%m-%d"
    // const dateRange = []
    // for (
    //   let date = new Date(startDate);
    //   date <= new Date(endDate);
    //   date.setDate(date.getDate() + 1)
    // ) {
    //   dateRange.push({ _id: date.toISOString().slice(0, 10), count: 0 })
    // }
    // console.log(dateRange)

    const posts = await postModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    return posts
  } catch (error) {
    throw error
  }
}

export const getTotalUsers = async () => {
  try {
    const totalUsers = await userModel.find()
    return totalUsers.length
  } catch (error) {
    throw error
  }
}
export const getTotalPosts = async () => {
  try {
    const totalPosts = await postModel.find()
    return totalPosts.length
  } catch (error) {
    throw error
  }
}
export const getTotalMedia = async () => {
  try {
    const totalMedia = await postModel.find({ media: { $exists: true } })
    return totalMedia.length
  } catch (error) {
    throw error
  }
}
export const getEliteUsers = async () => {
  try {
    const eliteUsers = await userModel.find({ elite: true })
    return eliteUsers.length
  } catch (error) {
    throw error
  }
}

export const getAllPostDetails = async (year, month) => {
  try {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 1)
    const dateFormat = "%Y-%m-%d"
    const data = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt",
            },
          },
          countWithMedia: {
            $sum: { $cond: [{ $ifNull: ["$media", false] }, 1, 0] },
          },
          countWithoutMedia: {
            $sum: {
              $cond: [{ $ifNull: ["$media", false] }, 0, 1],
            },
          },
        },
      },
    ])
    return data
  } catch (error) {
    throw error
  }
}
