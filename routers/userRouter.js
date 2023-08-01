import express from "express"
import {
  authenticate,
  validateUser,
  verifyOtp,
  isUserLoggedin,
  resendOtp,
  validateLogin,
  loginUser,
  authenticateGoogle,
  failedGoogleAuthentication,
  googleAuthenticate,
  verifyUser,
  checkToken,
  checkTempToken,
  resendEmailOtp,
} from "../controllers/authController.js"
import {
  validateDetails,
  addDetails,
  getDetails,
  getSearchResult,
  getUserDetails,
  setFriend,
  editUser,
  getFriendsList,
  getOnlineUsers,
  getUser,
  changePassword,
  tokenGeneration
} from "../controllers/userController.js"
import "../auth/localStrategy.js"
import "../auth/auth.js"
import "../auth/googleStrategy.js"
import upload from "../middlewares/multerConfig.js"
import passport from "passport"
const router = express.Router()

router.post("/agoraToken",tokenGeneration)

router.post("/register", validateUser, authenticate)

router.patch("/register/otp", verifyOtp)

router.get("/register/otp/resend", resendOtp)

router.patch("/register/details", isUserLoggedin, validateDetails, addDetails)

router.post("/login", validateLogin, loginUser)

router.get("/user/details", isUserLoggedin, getDetails)

router.get("/users/search", isUserLoggedin, getSearchResult)

router.get("/user/profile/:username", isUserLoggedin, getUserDetails)

router.patch("/friend/change", isUserLoggedin, setFriend)

router.patch(
  "/user/edit",
  isUserLoggedin,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPicture", maxCount: 2 },
  ]),

  editUser
)

router.get("/friends", isUserLoggedin, getFriendsList)

router.get("/users/online", isUserLoggedin, getOnlineUsers)

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get("/auth/google/callback", googleAuthenticate)

router.get("/auth/google/failure", failedGoogleAuthentication)

router.get("/email/identify", getUser)

router.patch("/email/otp/verify", verifyUser)

router.get("/email/otp/resend", resendEmailOtp)

router.patch("/user/password", checkToken, changePassword)

router.get("/verify", checkTempToken)

export default router
