import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import userModel from "../model/User.js"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://www1.kromium.shop/api/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const existing = await userModel.findOne({ googleId: profile.id })
        if (existing) {
          return done(null, existing, { message: "Logged in succesfully" })
        }
        const emailExisting = await userModel.findOne({
          email: profile.emails[0].value,
        })
        if (emailExisting) return done({ message: "User already exists" })
        const user = new userModel({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          username: (profile.name.givenName + profile.id).toLowerCase(),
          email: profile.emails[0].value,
          profilePicture: profile.photos[0]?.value,
          googleId: profile.id,
          isVerified: true,
        })
        await user.save()
        return done(null, user)
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
)
