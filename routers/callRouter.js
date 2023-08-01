import { Router } from "express"
import { isUserLoggedin } from "../controllers/authController.js"
import {
  createVideoCall,
  getCallDetails,
  createLiveStream,
  getLiveDetails,
} from "../controllers/callController.js"

const router = Router()

router.post("/video", isUserLoggedin, createVideoCall)

router.get("/video/:callId", isUserLoggedin, getCallDetails)

router.post("/live", isUserLoggedin, createLiveStream)

router.get("/live/:roomId", isUserLoggedin, getLiveDetails)

export default router
