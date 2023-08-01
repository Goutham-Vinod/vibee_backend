import mongoose from "mongoose"

const onlineUsersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  socketId: {
    type: String,
    required: true,
  },
})

onlineUsersSchema.methods.removeUser = function (socketId) {
  return this.model("OnlineUsers").deleteOne({ socketId })
}

const OnlineUsers = mongoose.model("OnlineUsers", onlineUsersSchema)

export default OnlineUsers
