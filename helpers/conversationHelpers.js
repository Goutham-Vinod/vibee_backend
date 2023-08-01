import mongoose from "mongoose"
import conversationModel from "../model/Conversations.js"
import messageModel from "../model/Messages.js"
import userModel from "../model/User.js"

export const getAllRelatedConversations = async (id) => {
  try {
    const conversations = await conversationModel.aggregate([
      {
        $match: {
          users: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "users",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
                pendingRequests: 0,
                pendingSentRequest: 0,
              },
            },
          ],
          as: "users",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$latestMessage"],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
                pendingRequests: 0,
                pendingSentRequest: 0,
              },
            },
          ],
          as: "sender",
        },
      },
      {
        $unwind: {
          path: "$sender",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          latestMessage: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    return conversations
  } catch (error) {
    throw error
  }
}

export const getAllMessages = async (conversationId, userId) => {
  try {
    const messages = await conversationModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(conversationId),
          users: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "users",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                password: 0,
                friends: 0,
                savedPosts: 0,
                pendingRequests: 0,
                pendingSentRequest: 0,
              },
            },
          ],
          as: "users",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversation",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      password: 0,
                      friends: 0,
                      savedPosts: 0,
                      pendingRequests: 0,
                      pendingSentRequest: 0,
                    },
                  },
                ],
                as: "sender",
              },
            },
            {
              $unwind: "$sender",
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
          ],
          as: "messages",
        },
      },
    ])
    return messages
  } catch (error) {
    throw error
  }
}

export const searchFromFriends = async (id, key) => {
  try {
    const results = await userModel.aggregate([
      {
        $match: {
          $or: [
            { username: new RegExp(key) },
            { firstName: new RegExp(key) },
            { lastName: new RegExp(key) },
          ],
        },
      },
      {
        $match: {
          friends: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ])
    return results
  } catch (error) {
    throw error
  }
}

export const removeUserFromConversation = async (
  id,
  userId,
  conversationId
) => {
  try {
    const conversation = await conversationModel.findById(conversationId)
    if (conversation.groupAdmin.toString() !== id && userId !== id) return false
    await conversationModel.findByIdAndUpdate(conversationId, {
      $pull: { users: userId },
    })
    return true
  } catch (error) {
    throw error
  }
}
