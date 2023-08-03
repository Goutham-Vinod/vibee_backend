import { Server } from "socket.io"
import conversationModel from "../model/Conversations.js"
import jwt from "jsonwebtoken"
import onlineUsersModel from "../model/OnlineUsers.js"
import userModel from "../model/User.js"
import callModel from "../model/Call.js"
import cron from "node-cron"
import { json } from "express"


const io = new Server({
  pingTimeout: 60000,
  cors: {
    origin:"*",
  },
})

io.on("connection", (socket) => {

  console.log("user connected", socket.id)
  socket.on("setup", async (userData) => {
    console.log('setup');
    console.log('__________________Socket io_____________________')
    console.log('setup json request',userData);
    console.log('_______________________________________')
    try {
      const user = jwt.verify(userData.slice(7), process.env.TOKEN_SECRET_KEY)
      const existing = await onlineUsersModel.findOne({ socketId: socket.id })
      if (existing) {
        return
      }
      //else {
      const newUser = new onlineUsersModel({
        userId: user.user.id,
        socketId: socket.id,
      })
      await newUser.save()
      if (newUser) {
        await newUser.populate("userId")
        const friends = newUser.userId.friends
        friends.forEach(async (friend) => {
          const onlineUser = await onlineUsersModel.findOne({
            userId: friend,
          })
          if (onlineUser)
            socket.to(onlineUser.socketId).emit("checkOnlineUsers")
            console.log('__________________Socket io_____________________')
            console.log('checkOnlineUsers response');
            console.log('_______________________________________')
        })
      }
      // }
      console.log("user joined")
      socket.join(user.user.id)
    } catch (error) {
      console.log(error)
    }
  })


  
  socket.on("testEvent", (message) => {
    console.log("some message is here",message)
    socket.broadcast.emit( 'testEvent',JSON.stringify(message))

  })



  socket.on("joinChat", (conversation) => {
    console.log('__________________Socket io_____________________')
    console.log('joinChat json request',conversation);
    console.log('______________________________________')
    console.log("user has joined",conversation)
    socket.join(conversation._id)
    console.log("User joined chat" + conversation._id)
  })

  socket.on("newMessage", async (message) => {
    console.log('__________________Socket io_____________________')
    console.log('newMessage json request',message);
    console.log('_______________________________________')
   console.log("user has send a message",message)

    const conversation = await conversationModel.findById(message.conversation)
    conversation.users.forEach((user) => {
      if (user._id.toString() === message.sender._id) return 
      socket.in(user._id.toString()).emit("latestMessage", JSON.stringify(message))
      console.log('__________________Socket io_____________________')
      console.log('latestMessage json response',message);
      console.log('_______________________________________')
    })
  })

  socket.on("newConversation", (userId) => {
    console.log('__________________Socket io_____________________')
    console.log('newConversation json request',userId);
    console.log('_____________________________________')
    socket.in(userId).emit("fetchConversation")
    console.log('__________________Socket io_____________________')
    console.log('fetchConversation json response',userId);
    console.log('_______________________________________')
  })

  socket.on("newNotification", async (notification) => {
    console.log('__________________Socket io_____________________')
    console.log('newNotification json request',notification);
    console.log('_______________________________________')
    const friends = notification.userId.friends
    for (let friend of friends) {
      const online = await onlineUsersModel.find({ userId: friend })
      if (online.length) {
        online.forEach((item) => {
          socket.to(item.socketId).emit("fetchNewNotification",JSON.stringify(notification))
          console.log('__________________Socket io_____________________')
          console.log('fetchNewNotification json response',notification);
          console.log('______________________________________')
        })
      }
    }
  })

  socket.on("postInteracted", async (notification) => { // like , share , comment
    console.log('__________________Socket io_____________________')
    console.log('postInteracted json request',notification);
    console.log('_______________________________________')
    try {
      if (!notification) return
      const userId = notification.postId.createdBy
      const user = await onlineUsersModel.find({ userId })
      if (user.length) {
        user.forEach((item) => {
          socket.to(item.socketId).emit("fetchNewNotification", JSON.stringify(notification))
          console.log('__________________Socket io_____________________')
          console.log('fetchNewNotification json response',notification);
          console.log('_______________________________________')
        })
      }
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("friendRequest", async (notification) => {
    console.log('__________________Socket io_____________________')
    console.log('friendRequest json request',notification);
    console.log('_______________________________________')
    if (!notification) return
    const userId = notification.to._id
    const user = await onlineUsersModel.find({ userId })
    if (user.length) {
      user.forEach((item) => {
        socket.to(item.socketId).emit("fetchNewNotification", JSON.stringify(notification))
        console.log('__________________Socket io_____________________')
        console.log('fetchNewNotification json response',notification);
        console.log('_______________________________________')
      })
    }
  })

  socket.on("videoCall", async ({ data, id }) => {
    print('video call event recived');

    console.log('__________________Socket io_____________________')
    console.log('videoCall json request',data,id);
    console.log('_______________________________________')
    try {
      const user = await userModel.findById(id)
      if (!user.friends.includes(data.to._id))
        return socket.emit("unauthorizedCall")
        console.log('__________________Socket io_____________________')
        console.log('unauthorizaedCall response');
        console.log('_______________________________________')
      const callee = await onlineUsersModel.find({ userId: data.to._id })
      if (callee.length) {
        callee.forEach((item) => {
          socket.to(item.socketId).emit("newCall", JSON.stringify(data))
          console.log('__________________Socket io_____________________')
          console.log('newCall json response',JSON.stringify(data));
          console.log('______________________________________')
          console.log("emitting call")
        })
      }
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("callRecieved", async (data) => {
    console.log('__________________Socket io_____________________')
    console.log('callRecieved json request',data);
    console.log('_______________________________________')
    const onlineUsers = await onlineUsersModel.find({ userId: data.from._id })
    onlineUsers.forEach((item) => {
      socket.to(item.socketId).emit("callForwarded")
      console.log('__________________Socket io_____________________')
      console.log('callForwarded response');
      console.log('______________________________________')
    })
  })

  socket.on("callAccepted", async (data) => {
    console.log('__________________Socket io_____________________')
    console.log('callAccepted json request',data);
    console.log('_______________________________________')
    const onlineUsers = await onlineUsersModel.find({ userId: data.from._id })
    onlineUsers.forEach((item) => {
      socket.to(item.socketId).emit("userJoined", JSON.stringify(socket.id))
      console.log('__________________Socket io_____________________')
      console.log('userJoined json response',socket.id);
      console.log('_______________________________________')
    })
    const callee = await onlineUsersModel.find({ userId: data.to._id })
    callee.forEach((item) => {
      socket.to(item._id).emit("userJoined", JSON.stringify(socket.id))
      console.log('__________________Socket io_____________________')
      console.log('userJoined json response',socket.id);
      console.log('______________________________________')
    })
  })

  socket.on("rejectCall", async (data) => { 
    console.log('__________________Socket io_____________________')
    console.log('callRejected json request',data);
    console.log('_______________________________________')
    const onlineUsers = await onlineUsersModel.find({ userId: data.from._id })
    onlineUsers.forEach((item) => {
      socket.to(item.socketId).emit("callRejected")
      console.log('__________________Socket io_____________________')
      console.log('callRejected response');
      console.log('_______________________________________')
    })
  })

  socket.on("disconnectCall", async (data) => {  // disconnecting an ongoing call
    console.log('__________________Socket io_____________________')
    console.log('callDisconnected json request',data);
    console.log('_______________________________________')
    const onlineUsers = await onlineUsersModel.find({ userId: data.to._id })
    onlineUsers.forEach((item) => {
      socket.to(item.socketId).emit("callDisconnected")
      console.log('__________________Socket io_____________________')
      console.log('callDisconnected response');
      console.log('_______________________________________')
    })
  })

  socket.on("setOffer", async ({ callId, offer, user }) => {
    console.log('__________________Socket io_____________________')
    console.log('setOffer json request',callId,offer,user);
    console.log('_______________________________________')
    try {
      const call = await callModel.findById(callId)
      if (call.from.toString() === user._id.toString()) {
        const onlineUser = await onlineUsersModel.find({ userId: call.to })
        onlineUser.forEach((item) => {
          console.log("emitting new offer")
          socket.to(item.socketId).emit("newOffer", { from: user._id, offer })
          console.log('__________________Socket io_____________________')
          console.log('newOffer json response',{ from: user._id, offer }); // JSON.stringify(from: user._id)
          console.log('______________________________________')
          
        })
      } else if (call.to.toString() === user._id.toString()) {
        const onlineUser = await onlineUsersModel.find({ userId: call.from })
        onlineUser.forEach((item) => {
          console.log("emitting new offer")
          socket.to(item.socketId).emit("newOffer", { from: user._id, offer })// JSON.stringify(from: user._id)
          console.log('__________________Socket io_____________________')
          console.log('newOffer json response',{ from: user._id, offer });
          console.log('_______________________________________')
          
        })
      }
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("callConnected", async ({ ans, callId }) => {
    console.log('__________________Socket io_____________________')
    console.log('callConnected json request',ans,callId);
    console.log('_______________________________________')
    try {
      console.log("reached here")
      console.log(ans)
      const user = await onlineUsersModel.findOne({ socketId: socket.id })
      const call = await callModel.findById(callId)
      console.log(callId)
      if (call.from.toString() === user.userId.toString()) {
        const onlineUser = await onlineUsersModel.find({ userId: call.to })
        onlineUser.forEach((item) => {
          socket
            .to(item.socketId)
            .emit("callConnected", { from: call.from, ans })
            console.log('__________________Socket io_____________________')
            console.log('callConnected json response',{ from: call.from, ans });
            console.log('_______________________________________')
           
        })
      } else if (call.to.toString() === user.userId.toString()) {
        const onlineUser = await onlineUsersModel.find({ userId: call.from })
        onlineUser.forEach((item) => {
          socket.to(item.socketId).emit("callConnected", { from: call.to, ans })
          console.log('__________________Socket io_____________________')
          console.log('callConnected json response', { from: call.to, ans });
          console.log('______________________________________')
    
        })
      }
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("disconnect", async () => {
    console.log('disconnect');
    try {
      const inactive = await onlineUsersModel.findOneAndDelete({
        socketId: socket.id,
      })
      if (!inactive) return
      await inactive.populate("userId")
      const friends = inactive.userId.friends
      friends.forEach(async (friend) => {
        const onlineUser = await onlineUsersModel.find({ userId: friend })
        if (onlineUser.length) {
          onlineUser.forEach((item) => {
            socket.to(item.socketId).emit("checkOnlineUsers")
            console.log('__________________Socket io_____________________')
            console.log('checkOnlineUsers response');
            console.log('_______________________________________')
          })
        }
      })
      console.log("user disconnected", socket.id)
    } catch (error) {
      console.log(error)
    }
  })
})

io.on("connect_error", (error) => {
  console.log("Socket connect_error:", error)
})

io.on("error", (error) => {
  console.log("Socket error:", error)
})

cron.schedule("0 */10 * * * *", async () => {
  const connectedSocketIDs = Array.from(io.of("/").sockets.keys())
  console.log(connectedSocketIDs)
  await onlineUsersModel.deleteMany({ socketId: { $nin: connectedSocketIDs } })
  console.log("deleted")
})

export default io
