import { Router } from "express"
import { isUserLoggedin } from "../controllers/authController.js"
import {
  getAllConversations,
  createNewConversation,
  getMessages,
  sendMessage,
  getSearchResults,
  addUserToConversation,
  removeUser,
  searchUsers,
  editConversation,
  sharePostAsMessage,
} from "../controllers/conversationController.js"
import upload from "../middlewares/groupChatConfig.js"

const router = Router()

router.get("/", isUserLoggedin, getAllConversations)

router.post(
  "/create",
  isUserLoggedin,
  upload.single("groupImage"),
  createNewConversation
)

router.get("/:conversationId", isUserLoggedin, getMessages)

router.post("/message/:conversationId", isUserLoggedin, sendMessage)

router.get("/:conversationId/search", isUserLoggedin, getSearchResults)

router.put("/:conversationId/user/add", isUserLoggedin, addUserToConversation)

router.put("/:conversationId/remove", isUserLoggedin, removeUser)

router.get("/search/users", isUserLoggedin, searchUsers)

router.patch(
  "/:conversationId/edit",
  isUserLoggedin,
  upload.single("groupImage"),
  editConversation
)

router.patch("/share", isUserLoggedin, sharePostAsMessage)

export default router
