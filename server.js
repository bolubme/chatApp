const express = require("express");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const cors = require("cors");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const GroupChat = require("./models/GroupChat");
const formatMessage = require("./utils/messages");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/groupUsers");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost/chat-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Run when a clients connects
io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    console.log("Connected");

    // socket.emit("message", formatMessage("bmeChat", `Welcome to Bme Chat`));

    // Remove

    // Load previous messages for the group
    const groupChat = await GroupChat.findOne({ name: user.room });
    if (groupChat) {
      const messages = groupChat.messages;
      socket.emit("previousMessages", messages);
      console.log(messages);
    }

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("bmeChat", `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen for chatMessage
  // socket.on("chatMessage", (msg) => {
  //   const user = getCurrentUser(socket.id);

  //   io.to(user.room).emit("message", formatMessage(user.username, msg));
  // });

  socket.on("chatMessage", async (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));

    // Save the message to the group's messages array
    const groupChat = await GroupChat.findOne({ name: user.room });
    if (groupChat) {
      groupChat.messages.push({
        sender: user.username,
        message: msg,
        timestamp: Date.now(),
      });
      await groupChat.save();
    }
  });

  //Runs when clients disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("bmeChat", `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Create Group chat
app.post("/groupchats", async (req, res) => {
  try {
    const { name } = req.body;
    const groupChat = await GroupChat.create({ name });
    io.emit("groupChatCreated", groupChat);
    res.status(201).json(groupChat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create Group chat" });
  }
});

// Get Group List
app.get("/groupchats", async (req, res) => {
  try {
    const groupChats = await GroupChat.find().sort("-createdAt");
    res.json(groupChats);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve Group chats" });
  }
});

// Routes
app.use("/", authRoutes);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Route handler for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route for the profile page
app.get("/profile", (req, res) => {
  res.sendFile(__dirname + "/public/profile.html");
});

// Route for the Chat page
app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

// Route for the Register page
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

// Route for the Login page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// Start the server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});