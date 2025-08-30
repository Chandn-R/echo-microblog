// components/chat/ChatPage.tsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { api } from "@/lib/services/api";

export interface User {
    _id: string;
    name: string;
    username: string;
    profilePicture: { secure_url: string };
}
export interface Message {
    _id: string;
    sender: User;
    content: string;
    chat: Conversation;
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

const socket = io("localhost:8000");

export function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] =
        useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);

     function fetchChats() {
        api.get("/chat");
    }
    function sendMessage (content: string, chatId: string) 
    {api.post("/message", { content, chatId });}
    useEffect(() => {
        const getChats = async () => {
            try {
                setLoading(true);
                const response = fetchChats();
                setConversations(response.data.data);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            } finally {
                setLoading(false);
            }
        };
        getChats();
    }, []);

    // --- Key Change: Updated socket logic for real-time updates ---
    useEffect(() => {
        socket.on("receiveMessage", (newMessage: Message) => {
            // Update the latestMessage for the relevant conversation in the list
            setConversations((prevConvos) =>
                prevConvos.map((convo) => {
                    if (convo._id === newMessage.chat._id) {
                        return { ...convo, latestMessage: newMessage };
                    }
                    return convo;
                })
            );
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConversation(conversation);
        socket.emit("joinRoom", conversation._id); // Join socket room for this chat
    };

    // --- Key Change: Handle sending message via API ---
    const handleSendMessage = async (messageText: string) => {
        if (!activeConversation) return;

        try {
            // The API call persists the message and returns the created message
            const response = await sendMessage(
                messageText,
                activeConversation._id
            );
            const newMessage = response.data.data;

            // Emit the new message to other users via socket
            socket.emit("sendMessage", newMessage);

            // Also update the latest message in the conversation list
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
                    {activeConversation ? (
                        <ChatWindow
                            key={activeConversation._id} // Add key to force re-mount on conversation change
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
