import { Router } from "express"
import { isAdminLoggedin } from "../controllers/authController.js"
import {
  deletePost,
  getAllPosts,
  getSinglePost,
  deleteComment,
} from "../controllers/adminPostController.js"

const router = Router()

router.get("/", isAdminLoggedin, getAllPosts)

router.patch("/delete", isAdminLoggedin, deletePost)

router.get("/:postId", isAdminLoggedin, getSinglePost)

router.patch("/:postId/comments/delete", isAdminLoggedin, deleteComment)

export default router
