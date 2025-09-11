import { useEffect, useState, useRef } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageComponent } from "./Message";
import { MessageInput } from "./MessageInput";
import { Skeleton } from "@/components/ui/skeleton";
// FIX: Use the default export from your api service
import api from "@/services/api";
import type { Conversation, Message, User } from "./ChatPage";
import { useAuth } from "@/context/AuthContext";
import { Socket } from "socket.io-client";

interface ChatWindowProps {
    conversation: Conversation;
    onSendMessage: (messageText: string) => void;
    socket: Socket;
}

// Helper to get the other user in a 1-on-1 chat
const getOtherUser = (users: User[], currentUser: User) => {
    return users.find((u) => u._id !== currentUser._id);
};

export function ChatWindow({
    conversation,
    onSendMessage,
    socket,
}: ChatWindowProps) {
    const { user: currentUser } = useAuth(); // FIX: Get the current user
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get display info for the header
    const otherUser =
        currentUser && !conversation.isGroupChat
            ? getOtherUser(conversation.users, currentUser)
            : null;
    const displayName = conversation.isGroupChat
        ? conversation.chatName
        : otherUser?.name;
    const displayAvatar = conversation.isGroupChat
        ? `https://api.dicebear.com/8.x/initials/svg?seed=${conversation.chatName}`
        : otherUser?.profilePicture?.secure_url;

    useEffect(() => {
        const getMessages = async () => {
            if (!conversation?._id) return;
            try {
                setLoading(true);
                // FIX: Use the api instance to make a GET request
                const response = await api.get(`/message/${conversation._id}`);
                setMessages(response.data.data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoading(false);
            }
        };
        getMessages();
    }, [conversation._id]);

    useEffect(() => {
        const handleNewMessage = (newMessage: Message) => {
            // FIX: Compare IDs directly. Assumes newMessage.chat is the chat ID string.
            if (newMessage.chat === conversation._id) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        };

        socket.on("receiveMessage", handleNewMessage);
        return () => {
            socket.off("receiveMessage", handleNewMessage);
        };
    }, [socket, conversation._id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!currentUser) return null; // Don't render if there's no user

    return (
        <Card className="rounded-lg shadow-sm h-full flex flex-col">
            {/* FIX: Populate the header with conversation details */}
            <CardHeader className="flex flex-row items-center space-x-4 p-4 border-b">
                <Avatar>
                    <AvatarImage
                        src={displayAvatar}
                        alt={displayName ?? "Chat"}
                    />
                    <AvatarFallback>
                        {displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{displayName}</p>
                </div>
            </CardHeader>

            <CardContent className="flex-grow p-6 space-y-6 overflow-y-auto">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-12 w-3/4 ml-auto" />
                        <Skeleton className="h-12 w-2/4" />
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageComponent
                            key={msg._id}
                            message={msg}
                            // FIX: Pass the current user's ID
                            currentUserId={currentUser._id}
                        />
                    ))
                )}
                <div ref={scrollRef} />
            </CardContent>
            <CardFooter className="p-4 border-t bg-background">
                <MessageInput onSendMessage={onSendMessage} />
            </CardFooter>
        </Card>
    );
}
