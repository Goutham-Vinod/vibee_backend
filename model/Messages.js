import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    content: String,
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversations",
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    isLink: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const Messages = mongoose.model("Messages", messageSchema)

export default Messages
