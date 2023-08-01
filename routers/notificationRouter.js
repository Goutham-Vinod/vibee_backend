import { Router } from "express"
import { isUserLoggedin } from "../controllers/authController.js"
import {
  getNotifications,
  setReadNotifications,
} from "../controllers/notificationController.js"
const router = Router()

router.get("/", isUserLoggedin, getNotifications)

router.patch("/read", isUserLoggedin, setReadNotifications)

export default router
