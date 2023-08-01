import mongoose from "mongoose"
import { config } from "dotenv"
config()

mongoose.set("strictQuery", true)
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to database")
  })
  .catch((error) => {
    console.log(`Couldn't connect to database: ${error}`)
  })

export default mongoose.connection
