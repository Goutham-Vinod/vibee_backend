import { Router } from "express"
import { isUserLoggedin } from "../controllers/authController.js"
import {
  createPost,
  getPosts,
  getPostOfOneUser,
  setLike,
  setComment,
  validateComment,
  loadPosts,
  loadComments,
  getSinglePost,
  editPost,
  deletePost,
  reportPost,
  getPostToShare,
  sharePost,
  getSharedPost,
  getAllDetailsOfSinglePost,
  deleteComment,
  savePost,
  getSavedPosts,
  unSavePost,
  getDiscoverPosts,
} from "../controllers/postController.js"
import {} from "../helpers/postHelper.js"
import upload from "../middlewares/multerConfig.js"
import "../auth/localStrategy.js"
import "../auth/auth.js"

const router = Router()

router.get("/", isUserLoggedin, getPosts)

router.post("/create", isUserLoggedin,upload.single("post"), createPost) 

router.get("/user/:username", isUserLoggedin, getPostOfOneUser)

router.patch("/like", isUserLoggedin, setLike)

router.patch("/comment", isUserLoggedin, validateComment, setComment)

router.get("/load", isUserLoggedin, loadPosts)

router.get("/:postId/comments", isUserLoggedin, loadComments)

router.get("/:postId", isUserLoggedin, getSinglePost)

router.patch("/:postId/edit", isUserLoggedin, editPost)

router.patch("/:postId/delete", isUserLoggedin, deletePost)

router.patch("/:postId/report", isUserLoggedin, reportPost)

router.get("/:postId/post", isUserLoggedin, getPostToShare)

router.post("/share", isUserLoggedin, sharePost)

router.get("/:postId/post/share", isUserLoggedin, getSharedPost)

router.get("/:postId/details", isUserLoggedin, getAllDetailsOfSinglePost)

router.patch("/:postId/comments/delete", isUserLoggedin, deleteComment)

router.patch("/save", isUserLoggedin, savePost)

router.get("/saved/posts", isUserLoggedin, getSavedPosts)

router.patch("/unsave", isUserLoggedin, unSavePost)

router.get("/discover/posts", isUserLoggedin, getDiscoverPosts)

export default router
 