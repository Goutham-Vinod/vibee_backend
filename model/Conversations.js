import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    chatName: String,
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    latestMessage: {
      type: new mongoose.Schema(
        {
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
          message: String,
        },
        { timestamps: true }
      ),
    },
    groupChatImage: String,
  },
  {
    timestamps: true,
  }
)

const Conversations = mongoose.model("Conversations", conversationSchema)

export default Conversations
