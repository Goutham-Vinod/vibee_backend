import userModel from "../model/User.js"
import postModel from "../model/Posts.js"
import {
  getAllNotifications,
  getPostOfOneMonth,
  getTotalMedia,
  getTotalPosts,
  getTotalUsers,
  getEliteUsers,
  getAllPostDetails,
} from "../helpers/adminHelper.js"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import xl from "excel4node"

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find()
    return res.json(users)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId).select("-password")
    user.isBlocked = !user.isBlocked
    await user.save()
    res.json(user)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params
    const user = await userModel
      .findById(id)
      .select("-password")
      .populate({ path: "friends", select: "-password" })
    res.json(user)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getPostsOfOneUser = async (req, res) => {
  try {
    const { userId } = req.params
    const posts = await postModel
      .find()
      .where({ createdBy: userId, shared: false })
    res.json(posts)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getActionsOfUser = async (req, res) => {
  try {
    const { userId } = req.params
    const actions = await getAllNotifications(userId)
    res.json(actions)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getPostofCurrentMonth = async (req, res) => {
  try {
    const year = new Date().getFullYear()
    const month = req.query.month || new Date().getMonth()
    const data = await getPostOfOneMonth(year, month)
    console.log(data)
    res.json(data)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getDetails = async (req, res) => {
  try {
    const totalUsers = await getTotalUsers()
    const totalPosts = await getTotalPosts()
    const totalMedia = await getTotalMedia()
    const eliteUsers = await getEliteUsers()
    res.json({ totalUsers, totalPosts, totalMedia, eliteUsers })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getPostDetails = async (req, res) => {
  try {
    const year = new Date().getFullYear()
    const month = req.query.month || new Date().getMonth()
    const postDetails = await getAllPostDetails(year, month)
    let data = []
    for (let item of postDetails) {
      let innerData = []
      for (let entries in item) {
        innerData.push(item[entries])
      }
      data.push(innerData)
    }
    const doc = new jsPDF()
    doc.autoTable({
      head: [["Date", "Posts With Media", "Posts Without Media"]],
      body: data,
    })
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const filePath = path.join(__dirname, "..", "public", "table.pdf")
    doc.save(filePath)
    // const pdf = doc.output("arraybuffer")
    // res.setHeader("Content-Type", "application/pdf")
    // res.setHeader("Content-Disposition", "attachment; filename=data.pdf")
    res.sendFile(filePath)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}

export const getExcelReport = async (req, res) => {
  try {
    const year = new Date().getFullYear()
    const month = req.query.month || new Date().getMonth()
    console.log(month)
    const postDetails = await getAllPostDetails(year, month)
    let data = [["Date", "Posts with media", "Posts without media"]]
    for (let item of postDetails) {
      let innerData = []
      for (let entries in item) {
        innerData.push(item[entries])
      }
      data.push(innerData)
    }
    const wb = new xl.Workbook()
    const ws = wb.addWorksheet("Sheet 1")
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (typeof data[i][j] === "number") {
          ws.cell(i + 1, j + 1).number(data[i][j])
        } else {
          ws.cell(i + 1, j + 1).string(data[i][j])
        }
      }
    }
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const filePath = path.join(__dirname, "..", "public", "table.xlsx")
    wb.write(filePath)
    res.sendFile(filePath)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Some error occured, Please try again later" })
  }
}
