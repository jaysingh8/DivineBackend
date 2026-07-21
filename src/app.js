import express, { urlencoded } from "express";
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser";
import passport from 'passport'
import { Strategy as GoogleStrategy} from 'passport-google-oauth20'
import cors from "cors"
import { config } from "./config/config.js";
import getterRouter from './routes/getter.routes.js'
import instantBookingRouter from './routes/instantBooking.route.js'

import eventRoute from './routes/eventBooking.routes.js'

const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
    origin: config.FRONTEND_URL || "divine-frontend-kohl.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  credentials: true

}))


/*
Google auth
*/

app.use(passport.initialize())

passport.use(new GoogleStrategy({
  clientID:config.GOOGLE_AUTH_API,
  clientSecret:config.GOOGLE_AUTH_SECRET,
  callbackURL:"/api/auth/google/callback"
},(accessToken, refreshToken, profile, done) => {
  return done(null, profile)
}))


/*
Api  
*/
app.use("/api/auth",authRouter)
app.use("/api/events",eventRoute)
app.use("/api",getterRouter)
app.use("/api/booking", instantBookingRouter)

export default app;
