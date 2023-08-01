import passport from "passport"
import { createToken } from "../helpers/authHelper.js"

export const loginAdmin = (req, res) => {
  passport.authenticate(
    "adminLogin",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          throw err
        }
        if (!user) {
          return res.status(401).json(info)
        }
        const token = createToken(user.id, user.email)
        return res.json({ success: true, token, user })
      } catch (error) {
        console.log(error)
        return res
          .status(500)
          .json({ message: "Something went wrong. Please try again later" })
      }
    }
  )(req, res)
}
