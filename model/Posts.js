import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    media: {
      type: String,
    },
    shared: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    comments: {
      type: [
        new mongoose.Schema(
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Users",
            },
            text: {
              type: String,
            },
            isDeleted: {
              type: Boolean,
              default: false,
            },
            reply: {
              type: [
                new mongoose.Schema(
                  {
                    userId: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "Users",
                    },
                    text: {
                      type: String,
                    },
                    isDeleted: {
                      type: Boolean,
                      default: false,
                    },
                  },
                  { timestamps: true }
                ),
              ],
            },
          },
          { timestamps: true }
        ),
      ],
    },
    reported: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    privacy: {
      type: String,
      enum: ["private", "public"],
      default: "public",
    },
    mimeType: {
      type: String,
    },
  },
  { timestamps: true }
)

postSchema.pre("find", function () {
  this.where({ isDeleted: false })
})
// postSchema.pre("aggregate", function () {
//   this.match({ isDeleted: false })
// })
postSchema.pre("findOne", function () {
  this.where({ isDeleted: false })
})
postSchema.pre("findOne", function () {
  this.where({ isDeleted: false })
})

const Posts = mongoose.model("Posts", postSchema)

export default Posts
