import { config } from "dotenv"
config()
import express from "express"
import cors from "cors"
import db from "./config/db.config.js"
import userRouter from "./routers/userRouter.js"
import postRouter from "./routers/postRouter.js"
import conversationRouter from "./routers/conversationRouter.js"
import notificationRouter from "./routers/notificationRouter.js"
import adminRouter from "./routers/adminRouter.js"
import adminPostRouter from "./routers/adminPostRouter.js"
import callRouter from "./routers/callRouter.js"
import paymentRouter from "./routers/paymentRouter.js"
import webhookRouter from "./routers/webhookRouter.js"
import io from "./sockets/socket.js"
import "./cron/nodeCron.js"

const app = express()

const PORT = process.env.PORT || 4000

app.use(express.static("./public"))
app.use(cors())
let server
db.once("open", () => {
  server = app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`)
  })
  io.attach(server)
})

app.use("/webhook", webhookRouter)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/api/payment", paymentRouter)
app.use("/api/conversation", conversationRouter)
app.use("/api/post", postRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/admin/post", adminPostRouter)
app.use("/api/admin", adminRouter)
app.use("/api/call", callRouter)
app.use("/api", userRouter)
