import { Server, Socket } from "socket.io";

interface UserData {
    _id: string;
    name: string;
}

export const initializeSocketIO = (io: Server) => {

    io.on("connection", (socket: Socket) => {
        console.log("A user connected:", socket.id);

        socket.on("setup", (userData: UserData) => {
            socket.join(userData._id);
            socket.emit("connected");
            console.log(`User ${userData.name || userData._id} setup with room ${userData._id}`);
        });

        socket.on("joinRoom", (room: string) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}