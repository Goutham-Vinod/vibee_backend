import passport from "passport"
import { Strategy as localStrategy } from "passport-local"
import adminModel from "../model/Admin.js"

passport.use(
  "adminLogin",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await adminModel.findOne({ email })
        if (!user) {
          return done(null, false, { message: "User not found" })
        }
        if (user.password !== password) {
          return done(null, false, { message: "Wrong Password" })
        }
        return done(null, user, { message: "Logged in successfully" })
      } catch (error) {
        return done(error)
      }
    }
  )
)
