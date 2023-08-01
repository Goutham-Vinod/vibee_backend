import {
  getAllRelatedConversations,
  getAllMessages,
  searchFromFriends,
  removeUserFromConversation,
} from "../helpers/conversationHelpers.js"
import conversationModel from "../model/Conversations.js"
import messageModel from "../model/Messages.js"
import path from "path"

export const getAllConversations = async (req, res) => {
  const { id } = req.user
  try {
    const conversations = await getAllRelatedConversations(id)
    res.json(conversations)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const createNewConversation = async (req, res) => {
  try {
    console.log("here")
    const { id } = req.user
    let { members, isGroupChat, chatName } = req.body
    console.log(members)
    // if (isGroupChat) members = JSON.parse(members)
    console.log(members)
    members.push(id)
    let conversation
    if (isGroupChat) {
      if (!chatName?.trim().length)
        return res
          .status(400)
          .json({ chatName: "Conversation name cannot be empty" })
      conversation = new conversationModel({
        chatName,
        isGroupChat: true,
        groupAdmin: id,
        users: members,
      })
    } else {
      let existing = await conversationModel.find({
        users: { $all: members },
        isGroupChat: false,
      })
      console.log(existing)
      if (existing.length) {
        return res.status(409).json({
          message: "Conversation already exists",
          conversation: existing[0],
        })
      }
      conversation = new conversationModel({
        users: members,
      })
    }
    if (req.file) {
      let filePath =
        process.env.BASE_URL +
        req.file.path.slice(7).replace(new RegExp("\\" + path.sep, "g"), "/")
      conversation.groupChatImage = filePath
    }
    await conversation.save()
    await conversation.populate("users")
    return res.status(201).json(conversation)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id } = req.user
    const { conversationId } = req.params
    const messages = await getAllMessages(conversationId, id)
    res.json(messages[0])
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.user
    const { content } = req.body
    const { conversationId } = req.params
    const conversation = await conversationModel.findById(conversationId)
    if (!conversation.users.includes(id))
      return res.status(403).json({ message: "Not in the group" })
    const message = new messageModel({
      sender: id,
      content,
      conversation: conversationId,
    })
    await message.save()
    await conversationModel.findByIdAndUpdate(conversationId, {
      "latestMessage.sender": id,
      "latestMessage.message": content,
    })
    await message.populate("sender")
    console.log(message)
    res.status(201).json(message)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const getSearchResults = async (req, res) => {
  const { id } = req.user
  const { conversationId } = req.params
  const { key } = req.query
  try {
    const users = await searchFromFriends(id, key)
    const conversation = await conversationModel.findById(conversationId)
    const filteredUser = users.filter(
      (item) => !conversation.users.includes(item._id)
    )
    res.json(filteredUser)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const addUserToConversation = async (req, res) => {
  try {
    const { id } = req.user
    const { conversationId } = req.params
    const { userId } = req.body
    const conversation = await conversationModel.findById(conversationId)
    console.log(conversation.groupAdmin.toString())
    if (conversation?.groupAdmin?.toString() !== id)
      return res.status(401).json({ error: "Not group admin" })
    await conversationModel.findByIdAndUpdate(conversationId, {
      $push: { users: userId },
    })
    return res.json({ success: true })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const removeUser = async (req, res) => {
  try {
    const { id } = req.user
    const { conversationId } = req.params
    const { userId } = req.body
    const isRemoved = await removeUserFromConversation(
      id,
      userId,
      conversationId
    )
    if (isRemoved) return res.json({ success: true })
    else return res.status(401).json({ error: "Not group admin" })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const { id } = req.user
    const { key } = req.query
    const result = await searchFromFriends(id, key)
    res.json(result)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const editConversation = async (req, res) => {
  try {
    const { id } = req.user
    const { conversationId } = req.params
    const conversation = await conversationModel.findById(conversationId)
    console.log(conversation)
    console.log(conversationId)
    const { chatName } = req.body
    if (!chatName?.trim()?.length)
      return res.status(400).json({ chatName: "Enter a valid name" })
    conversation.chatName = chatName
    if (req.file) {
      let filePath =
        process.env.BASE_URL +
        req.file.path.slice(7).replace(new RegExp("\\" + path.sep, "g"), "/")
      conversation.groupChatImage = filePath
    }
    await conversation.save()
    res.json(conversation)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const sharePostAsMessage = async (req, res) => {
  try {
    const { id } = req.user
    const { checked, postId } = req.body
    const content = `/post/${postId}`
    const data = []
    for (let conversationId of checked) {
      const conversation = await conversationModel.findById(conversationId)
      if (!conversation.users.includes(id))
        return res.status(403).json({ message: "Not in the group" })
      const message = new messageModel({
        sender: id,
        content,
        conversation: conversationId,
        isLink: true,
      })
      await message.save()
      await conversationModel.findByIdAndUpdate(conversationId, {
        "latestMessage.sender": id,
        "latestMessage.message": content,
      })
      await message.populate("sender")
      data.push(message)
    }
    res.status(201).json(data)
  } catch (error) {
    console.log(error)
  }
}
