const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Router = require("./router/routes");
const ApiRoute = require("./api/routes")
const ClouniaryRouter = require("./helper/cloudinary-helper")
const { conn } = require("./conn")
const app = express();
const http = require('http').createServer(app)
const { Server } = require("socket.io");
const { userInfo } = require("os");
require('dotenv').config();//loading env file


const io = new Server(
  http,
  {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  }
)

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",        // which frontend can access
  methods: ["GET", "PUT", "POST", "DELETE"],  // allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
  credentials: true,                       // allow cookies
  optionsSuccessStatus: 200
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(Router)
app.use(ClouniaryRouter)
app.use(ApiRoute)
const PORT = process.env.PORT || 8000;
const roomMembers = []
const userNameMap = new Map()
const socketToRoom = new Map()
const offerToRoomMap = new Map()
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", async () => {
    const id = socket.id;
    const user = userNameMap.get(id);
    const roomId = socketToRoom.get(id);

    console.log("User disconnected:", id);
    console.log("user:", user);
    console.log("roomId:", roomId);

    if (roomId && user) {
      socket.to(roomId).emit("user-left", user);
      const socketsInRoom = await io.in(roomId).fetchSockets();
      io.in(roomId).emit("room-members", socketsInRoom.length);
    }

    userNameMap.delete(id);
    socketToRoom.delete(id);
  });





  socket.on("join-room", async (data) => {
    const { roomId } = data
    socket.join(roomId);
    socket.emit("join-room", roomId); 
    //send event to all members of room except sender
    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      ...data
    });
    userNameMap.set(socket.id, data.user)
    socketToRoom.set(socket.id, roomId)

    console.log("joining with room id", roomId);

    const existingOffer = offerToRoomMap.get(roomId);
    if (existingOffer) {
      socket.emit('offer', existingOffer);
    }

    const socketInRoom = await io.in(roomId).fetchSockets();
    const socketArray = Array.from(socketInRoom).map((spckets) => spckets.id);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    console.log(socketArray)
    io.in(roomId).emit("room-members", socketArray.length); //send to all members of room
  });



  socket.on("message", (message) => {
    io.to(message.roomId).emit("message", message)
  })


  socket.on("offer", (data) => {
    console.log("offer received", data)
    //storing offer sent by creater to send other members
    offerToRoomMap.set(data.roomId, data)
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", data.answer);
  });

  socket.on("call-accepted", ({ caller, answer }) => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit("call-accepted", { caller, answer });
    }
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", data.candidate);
  });
});


http.listen(PORT, () => {
  console.log(" Server is listening at port number:", PORT);
});
