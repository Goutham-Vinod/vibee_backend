import passport from "passport"
import { Strategy as JWTstrategy } from "passport-jwt"
import { ExtractJwt } from "passport-jwt"

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.TOKEN_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user)
      } catch (error) {
        done(error)
      }
    }
  )
)
