import { io } from "./app";

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Setup initial user data (e.g., from authentication middleware)
    socket.on("setup", (userData) => {
        socket.join(userData._id); // User joins a personal room for notifications
        socket.emit("connected");
    });

    // Join a chat room
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle sending messages
    socket.on("sendMessage", (newMessage) => {
        const chat = newMessage.chat;
        if (!chat.users) return console.log("Chat.users not defined");

        // Broadcast the message to everyone in the room except the sender
        chat.users.forEach((user:any) => {
            if (user._id === newMessage.sender._id) return;
            socket.in(user._id).emit("receiveMessage", newMessage);
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
