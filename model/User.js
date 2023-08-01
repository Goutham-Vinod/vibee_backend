import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    location: {
      type: String,
    },
    dob: {
      type: Date,
      // required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
    profilePicture: {
      type: String,
    },
    coverPicture: {
      type: String,
    },
    pendingRequests: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    blockedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    savedPosts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Posts",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
    },
    pendingSentRequest: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
    googleId: {
      type: String,
    },
    eliteVerified: {
      type: String,
      enum: ["pending", "verified", "rejected"],
    },
    elite: {
      type: Boolean,
      default: false,
    },
    eliteStartDate: {
      type: Date,
    },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "cancelled"],
      default: "inactive",
    },
    otp: {
      type: String,
    },
  },
  { timestamps: true }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
  next()
})
userSchema.methods.isValidPassword = async function (password) {
  const compare = await bcrypt.compare(password, this.password)
  return compare
}

const Users = mongoose.model("Users", userSchema)

export default Users
