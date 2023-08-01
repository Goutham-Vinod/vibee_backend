import userModel from "../model/User.js"
import postModel from "../model/Posts.js"
import mongoose from "mongoose"

const isDescriptionValid = (description) => {
  const value = description.trim()
  if (!(value.length > 0)) {
    return false
  }
  return true
}

export const isPostValid = (post) => {
  const errors = {}
  if (!isDescriptionValid(post.description)) {
    errors.description = "Please enter a valid description"
  }
  if (!post.privacy) {
    errors.privacy = "Please select a privacy option"
  }
  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}

export const isPostWithImageValid = (post) => {
  const errors = {}
  if (!post.privacy) {
    errors.privacy = "Please select a privacy option"
  }
  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}

export const getAllRelatedPosts = async (id, skip = 0) => {
  try {
    const posts = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
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
        $unwind: {
          path: "$postId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$createdBy",
        },
      },
      {
        $match: {
          $or: [
            {
              "createdBy._id": new mongoose.Types.ObjectId(id),
            },
            {
              "createdBy.friends": new mongoose.Types.ObjectId(id),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $set: {
          comments: {
            $map: {
              input: "$comments",
              as: "s",
              in: {
                $mergeObjects: [
                  "$$s",
                  {
                    userId: {
                      $filter: {
                        input: "$userId",
                        as: "s2",
                        cond: {
                          $eq: ["$$s2._id", "$$s.userId"],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: "userId",
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
        $limit: 10,
      },
    ])
    return posts
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const isCommentValid = (comment) => {
  const errors = {}
  if (!(comment.trim().length > 0)) {
    errors.comment = "Please enter a valid comment"
  }
  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}

export const getTotalPostsNumber = async (id) => {
  try {
    console.log(id)
    const count = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$createdBy",
        },
      },
      {
        $match: {
          $or: [
            {
              "createdBy._id": new mongoose.Types.ObjectId(id),
            },
            {
              "createdBy.friends": new mongoose.Types.ObjectId(id),
            },
          ],
        },
      },
      // {
      //   $count: "totalPosts",
      // },
    ])
    return count
  } catch (error) {
    throw error
  }
}

export const getCommentsFromPost = async (postId, skip) => {
  try {
    const comments = await postModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $project: {
          comments: 1,
          _id: 0,
        },
      },
      {
        $unwind: {
          path: "$comments",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$comments"],
          },
        },
      },
      {
        $project: {
          comments: 0,
        },
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
        $unwind: {
          path: "$userId",
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
        $limit: 10,
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ])
    return comments
  } catch (error) {
    throw error
  }
}

export const getPostForUserProfile = async (id) => {
  try {
    const posts = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(id),
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
                as: "createdBy",
              },
            },
            {
              $unwind: "$createdBy",
            },
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
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    return posts
  } catch (error) {
    throw error
  }
}

export const getPublicPostForUserProfile = async (id) => {
  try {
    const posts = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(id),
          privacy: "public",
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
                as: "createdBy",
              },
            },
            {
              $unwind: "$createdBy",
            },
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
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    return posts
  } catch (error) {
    throw error
  }
}

export const getPostsInDiscover = async (id, skip) => {
  try {
    const posts = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $match: {
          privacy: "public",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$createdBy",
        },
      },
      {
        $match: {
          "createdBy.friends": {
            $nin: [new mongoose.Types.ObjectId(id)],
          },
        },
      },
      {
        $match: {
          "createdBy._id": {
            $nin: [new mongoose.Types.ObjectId(id)],
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: 10,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    return posts
  } catch (error) {
    throw error
  }
}

export const getTotalNumberPostsInDiscover = async (id) => {
  try {
    const posts = await postModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $match: {
          privacy: "public",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$createdBy",
        },
      },
      {
        $match: {
          "createdBy.friends": {
            $nin: [new mongoose.Types.ObjectId(id)],
          },
        },
      },
      {
        $match: {
          "createdBy._id": {
            $nin: [new mongoose.Types.ObjectId(id)],
          },
        },
      },
    ])
    return posts.length
  } catch (error) {
    throw error
  }
}
