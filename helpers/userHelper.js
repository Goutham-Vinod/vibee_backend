import userModel from "../model/User.js"
import onlineUserModel from "../model/OnlineUsers.js"
import mongoose from "mongoose"

export const getOnlineUsersFromFriends = async (id) => {
  try {
    const onlineUsers = await onlineUserModel.aggregate([
      {
        $group: {
          _id: "$userId",
          docId: {
            $first: "$_id",
          },
          socketId: {
            $first: "$socketId",
          },
        },
      },
      {
        $project: {
          _id: "$docId",
          userId: "$_id",
          socketId: "$socketId",
        },
      },
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
        $match: {
          "userId.friends": new mongoose.Types.ObjectId(id),
        },
      },
    ])
    return onlineUsers
  } catch (error) {
    throw error
  }
}

export const filterUserSearch = async (key, friends, skip, id) => {
  try {
    const result = await userModel.aggregate([
      {
        $match: {
          $or: [
            { firstName: new RegExp(key, "i") },
            { lastName: new RegExp(key, "i") },
            { username: new RegExp(key, "i") },
          ],
        },
      },
      {
        $match: {
          friends: {
            $in: friends,
          },
        },
      },
      {
        $match: {
          _id: {
            $ne: new mongoose.Types.ObjectId(id),
          },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: 10,
      },
    ])
    return result
  } catch (error) {
    throw error
  }
}

export const filterUserCount = async (key, friends, skip, id) => {
  try {
    const result = await userModel.aggregate([
      {
        $match: {
          $or: [
            { firstName: new RegExp(key, "i") },
            { lastName: new RegExp(key, "i") },
            { username: new RegExp(key, "i") },
          ],
        },
      },
      {
        $match: {
          friends: {
            $in: friends,
          },
        },
      },
      {
        $match: {
          _id: {
            $ne: new mongoose.Types.ObjectId(id),
          },
        },
      },
    ])
    return result.length
  } catch (error) {
    throw error
  }
}
