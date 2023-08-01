import { Router } from "express"
import {
  isAdminLoggedin,
  validateLogin,
} from "../controllers/authController.js"
import "../auth/adminLocalStrategy.js"
import { loginAdmin } from "../controllers/adminController.js"
import {
  getAllUsers,
  blockUser,
  getUserDetails,
  getPostsOfOneUser,
  getActionsOfUser,
  getPostofCurrentMonth,
  getDetails,
  getPostDetails,
  getExcelReport,
} from "../controllers/adminUserController.js"
const router = Router()

router.post("/login", validateLogin, loginAdmin)

router.get("/users", isAdminLoggedin, getAllUsers)

router.patch("/user/block", isAdminLoggedin, blockUser)

router.get("/user/:id", isAdminLoggedin, getUserDetails)

router.get("/user/post/:userId", isAdminLoggedin, getPostsOfOneUser)

router.get("/user/actions/:userId", isAdminLoggedin, getActionsOfUser)

router.get("/postdata", isAdminLoggedin, getPostofCurrentMonth)

router.get("/dashboard/details", isAdminLoggedin, getDetails)

router.get("/post/details/pdf", isAdminLoggedin, getPostDetails)

router.get("/post/details/excel", isAdminLoggedin, getExcelReport)

export default router
