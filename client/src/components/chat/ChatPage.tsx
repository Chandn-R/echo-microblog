import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";


export interface User {
    _id: string;
    name: string;
    username: string;
    profilePicture?: { secure_url: string };
}
export interface Message {
    _id: string;
    sender: User;
    content: string;
    chat: string;
    createdAt: string;
}
export interface Conversation {
    _id: string;
    chatName?: string;
    isGroupChat: boolean;
    users: User[];
    latestMessage?: Message;
    groupAdmin?: User;
}

// --- Best Practice: Initialize socket as null ---
let socket: Socket | null = null;

export function ChatPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] =
        useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Best Practice: Manage socket connection in useEffect ---
    useEffect(() => {
        // Connect only when the user is authenticated
        if (user) {
            socket = io("http://localhost:8000"); // Use http:// for clarity

            // Cleanup on component unmount
            return () => {
                socket?.disconnect();
                socket = null;
            };
        }
    }, [user]);

    // --- Effect for fetching initial chats ---
    useEffect(() => {
        const getChats = async () => {
            try {
                setLoading(true);
                // FIX: Await the API call directly.
                const response = await api.get("/chat");
                setConversations(response.data.data);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            } finally {
                setLoading(false);
            }
        };
        getChats();
    }, []);

    // --- Effect for handling incoming messages ---
    useEffect(() => {
        const handleReceiveMessage = (newMessage: Message) => {
            setConversations((prevConvos) => {
                const updatedConvos = prevConvos.map((convo) => {
                    if (convo._id === newMessage.chat) {
                        return { ...convo, latestMessage: newMessage };
                    }
                    return convo;
                });
                // Improvement: Sort conversations to bring the newest to the top
                return updatedConvos.sort(
                    (a, b) =>
                        new Date(b.latestMessage?.createdAt ?? 0).getTime() -
                        new Date(a.latestMessage?.createdAt ?? 0).getTime()
                );
            });
        };

        socket?.on("receiveMessage", handleReceiveMessage);

        // FIX: Provide the correct handler to off() for cleanup
        return () => {
            socket?.off("receiveMessage", handleReceiveMessage);
        };
    }, []); // This effect runs once to set up the listener

    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConversation(conversation);
        socket?.emit("joinRoom", conversation._id);
    };

    const handleSendMessage = async (messageText: string) => {
        if (!activeConversation || !socket) return;

        try {
            // FIX: The API call must be awaited and must return a promise
            const response = await api.post("/message", {
                content: messageText,
                chatId: activeConversation._id,
            });
            const newMessage: Message = response.data.data;

            // Emit the message to other users
            socket.emit("sendMessage", newMessage);

            // Update the conversation list with the new latest message
            setConversations((prevConvos) =>
                prevConvos.map((convo) =>
                    convo._id === activeConversation._id
                        ? { ...convo, latestMessage: newMessage }
                        : convo
                )
            );
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        // The JSX remains largely the same
        <div className="container mx-auto px-3 max-w-7xl h-screen flex flex-col">
            <div className="flex flex-col lg:flex-row gap-8 flex-grow min-h-0 py-8">
                <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                    <ChatList
                        conversations={conversations}
                        activeConversationId={activeConversation?._id}
                        onSelectConversation={handleSelectConversation}
                        loading={loading}
                    />
                </div>
                <div className="w-full flex-grow">
                    {activeConversation && socket ? ( // Also check for socket
                        <ChatWindow
                            key={activeConversation._id}
                            conversation={activeConversation}
                            onSendMessage={handleSendMessage}
                            socket={socket}
                        />
                    ) : (
                        <Card className="rounded-lg shadow-sm h-full flex items-center justify-center">
                            <CardContent>
                                <p className="text-gray-500">
                                    Select a conversation to start chatting.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
