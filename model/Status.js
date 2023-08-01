import mongoose from "mongoose"

const Status = new mongoose.Schema({
  status: {
    type: String,
  },
  description: {
    type: String,
  },
})

const status = mongoose.model("Status", statusSchema)

export default status
