
import AgoraAccessToken from 'agora-access-token';

const { RtcTokenBuilder, RtcRole } = AgoraAccessToken;


import {
  checkDetails,
  sendMail,
  validateUpdatedDetails,
  validatePassword,
} from "../helpers/authHelper.js";
import {
  getOnlineUsersFromFriends,
  filterUserSearch,
  filterUserCount,
} from "../helpers/userHelper.js";
import userModel from "../model/User.js";
import notificationModel from "../model/Notifications.js";
import paymentModel from "../model/Payment.js";
import path from "path";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
// const Buffer = require('buffer').Buffer;
import { Readable } from "stream";
import { ObjectId } from "mongodb";

cloudinary.config({
  cloud_name: "dz0nfpq1h",
  api_key: "623364754177291",
  api_secret: "2Oxe7RYL-N2jpZYqLtilJnDJizk",
});

export const validateDetails = async (req, res, next) => {
  try {
    const { isValid, errors } = checkDetails(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const { username, location, gender } = req.body;
    const existing = await userModel.findOne({ username: username });
    if (existing) {
      return res.status(407).json({ message: "Username already exists" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const addDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const { username, location, gender } = req.body;
    await userModel.findByIdAndUpdate(id, {
      $set: { username, location, gender },
    });
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later",
    });
  }
};

export const getDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await userModel.findById(id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSearchResult = async (req, res) => {
  try {
    const { id } = req.user;
    const { key } = req.query;
    const { filter } = req.query;
    console.log(filter);
    let skip = req.query.skip || 0;
    skip *= 10;
    if (filter === "true") {
      const user = await userModel.findById(id);
      const result = await filterUserSearch(key, user.friends, skip, id);
      const count = await filterUserCount(key, user.friends, skip, id);
      return res.json({ result, count });
    }
    if (key) {
      const result = await userModel
        .find({
          $and: [
            {
              $or: [
                { firstName: new RegExp(key, "i") },
                { lastName: new RegExp(key, "i") },
                { username: new RegExp(key, "i") },
              ],
            },
            {
              _id: {
                $ne: new mongoose.Types.ObjectId(id),
              },
            },
          ],
        })
        .select("-password")
        .skip(skip)
        .limit(10);
      const count = await userModel.find({
        $and: [
          {
            $or: [
              { firstName: new RegExp(key, "i") },
              { lastName: new RegExp(key, "i") },
              { username: new RegExp(key, "i") },
            ],
          },
          {
            _id: {
              $ne: new mongoose.Types.ObjectId(id),
            },
          },
        ],
      });
      return res.json({ result, count });
    }
    return res.json({ result: [] });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userModel.findOne({ username }).select("-password");
    if (user) {
      const check = await userModel.findById(req.user.id).select("-password");
      const friend = check.friends.includes(user._id);
      const pending = check.pendingSentRequest.includes(user._id);
      const requestReceived = check.pendingRequests.includes(user._id);
      return res.json({
        user,
        loggedinUser: req.user,
        friend,
        pending,
        requestReceived,
      });
    } else {
      return res.status(404).json({ message: "Requested user not found" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};
export const setFriend = async (req, res) => {
  try {
    const { id } = req.user;
    const friendId = req.body.id;
    console.log(id, friendId);
    const user = await userModel.findById(id);
    if (user.friends.includes(friendId)) {
      console.log("here");
      await userModel.findByIdAndUpdate(id, {
        $pull: { friends: friendId },
      });
      await userModel.findByIdAndUpdate(friendId, {
        $pull: { friends: id },
      });
      return res.json({ success: true, message: "Add Friend" });
    } else if (user.pendingSentRequest.includes(friendId)) {
      await userModel.findByIdAndUpdate(id, {
        $pull: { pendingSentRequest: friendId },
      });
      await userModel.findByIdAndUpdate(friendId, {
        $pull: { pendingRequests: id },
      });
      return res.json({ success: true, message: "Add Friend" });
    } else if (user.pendingRequests.includes(friendId)) {
      await userModel.findByIdAndUpdate(id, {
        $pull: { pendingRequests: friendId },
      });
      await userModel.findByIdAndUpdate(friendId, {
        $pull: { pendingSentRequest: id },
      });
      await userModel.findByIdAndUpdate(id, { $push: { friends: friendId } });
      await userModel.findByIdAndUpdate(friendId, { $push: { friends: id } });
      const notification = new notificationModel({
        type: "acceptedRequest",
        userId: id,
        to: friendId,
      });
      await notification.save();
      await notification.populate({ path: "userId", select: "-password" });
      await notification.populate({ path: "to", select: "-password" });
      return res.json({ success: true, message: "Unfriend", notification });
    } else {
      await userModel.findByIdAndUpdate(id, {
        $push: { pendingSentRequest: friendId },
      });
      await userModel.findByIdAndUpdate(friendId, {
        $push: { pendingRequests: id },
      });
      const notification = new notificationModel({
        type: "friendRequest",
        userId: id,
        to: friendId,
      });
      await notification.save();
      await notification.populate({ path: "userId", select: "-password" });
      await notification.populate({ path: "to", select: "-password" });
      return res.json({ success: true, message: "Request Sent", notification });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.user;
    const { isValid, errors } = validateUpdatedDetails(req.body);
    if (!isValid) return res.status(400).json(errors);
    const user = await userModel.findById(id);
    const { firstName, lastName, username, email, location, date } = req.body;
    const existing = await userModel.findOne({ username: username });
    if (existing) {
      if (existing._id.toString() !== user._id.toString())
        return res.status(400).json({ username: "Username already exists" });
    }

    if (req?.files?.coverPicture) {
      // console.log(req.files.coverPicture)
      const coverPath = req.files.coverPicture[0].path
        .slice(7)
        .replace(new RegExp("\\" + path.sep, "g"), "/");
      const coverFilePath = process.env.BASE_URL + coverPath;
      user.coverPicture = coverFilePath;
    }
    if (req?.files?.profilePicture) {
      const profilePath = req.files.profilePicture[0].path
        .slice(7)
        .replace(new RegExp("\\" + path.sep, "g"), "/");
      const profileFilePath = process.env.BASE_URL + profilePath;
      user.profilePicture = profileFilePath;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.location = location;
    user.dob = date;

    await user.save();
    console.log(user);
    const updatedUser = await userModel.findById(id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await userModel
      .findById(id)
      .populate({ path: "friends", select: "-password" });
    res.json(user.friends);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const { id } = req.user;
    const onlineUsers = await getOnlineUsersFromFriends(id);
    return res.json(onlineUsers);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (
      !email.trim() ||
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
    )
      return res.status(400).json({ email: "Please provide a valid email" });
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ email: "The email provided is not registered" });
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();
    sendMail(email, otp);
    res.json({ id: user._id });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email } = req.user;
    console.log(req.user);
    const { password } = req.body;
    const { isValid, errors } = validatePassword(req.body);
    if (!isValid) return res.status(400).json(errors);
    const user = await userModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid token" });
    user.password = password;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};

export const tokenGeneration = (req, res) => {
 console.log('tocken Generation');
  try {
    const {  channelName } = req.body;
    const uid = 0
    var appID = "26053c3e0f544c3f9b70e4d96548a613";
    var appCertificate = "4386c6d578834a17b0f2d46dc2bd0fa8";
    var expirationTimeInSeconds = 3600;
    var role = RtcRole.PUBLISHER;
    var currentTimestamp = Math.floor(Date.now() / 1000);
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // use 0 if uid is not specified

    if (!channelName) {
      return res.status(400).json({ error: "channel name is required" }).send();
    }

    var key = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
     uid,
      role,
      privilegeExpiredTs
    );
    console.log(key);
    res.header("Access-Control-Allow-Origin", "*");
    //resp.header("Access-Control-Allow-Origin", "http://ip:port")
    return res.json({ key: key }).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, Please try again later" });
  }
};
