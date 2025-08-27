import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Paperclip } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("localhost:8000");

// --- Type Definitions ---
interface Conversation {
    id: number;
    name: string;
    username: string;
    avatarUrl: string;
    lastMessage: string;
    timestamp: string;
}
interface Message {
    id: number;
    sender: "me" | "them";
    text: string;
}
type MessageHistory = Record<number, Message[]>;

// --- Mock Data ---
const mockConversations: Conversation[] = [
    {
        id: 1,
        name: "Alice Johnson",
        username: "alicej",
        avatarUrl: "https://i.pravatar.cc/150?u=alice",
        lastMessage: "Sounds good! I'll see you then.",
        timestamp: "10:42 AM",
    },
    {
        id: 2,
        name: "Bob Williams",
        username: "bobw",
        avatarUrl: "https://i.pravatar.cc/150?u=bob",
        lastMessage: "Can you send over the file?",
        timestamp: "9:15 AM",
    },
    {
        id: 3,
        name: "Charlie Brown",
        username: "charlieb",
        avatarUrl: "https://i.pravatar.cc/150?u=charlie",
        lastMessage: "You: Yes, I've finished the report.",
        timestamp: "Yesterday",
    },
    // Add more conversations to test scrolling on the left side
    {
        id: 4,
        name: "Diana Prince",
        username: "dianap",
        avatarUrl: "https://i.pravatar.cc/150?u=diana",
        lastMessage: "Perfect!",
        timestamp: "Yesterday",
    },
    {
        id: 5,
        name: "Ethan Hunt",
        username: "ethanh",
        avatarUrl: "https://i.pravatar.cc/150?u=ethan",
        lastMessage: "Got it, thanks!",
        timestamp: "2 days ago",
    },
    {
        id: 6,
        name: "Fiona Glenanne",
        username: "fionag",
        avatarUrl: "https://i.pravatar.cc/150?u=fiona",
        lastMessage: "Let's catch up tomorrow.",
        timestamp: "2 days ago",
    },
];
const mockMessages: MessageHistory = {
    1: [
        { id: 1, sender: "them", text: "Hey! How's the project going?" },
        {
            id: 2,
            sender: "me",
            text: "Hi Alice! It's going well. I should be done by tomorrow.",
        },
        {
            id: 3,
            sender: "them",
            text: "Great to hear. Let's sync up tomorrow afternoon then.",
        },
        { id: 4, sender: "me", text: "Perfect. Does 3 PM work for you?" },
        { id: 5, sender: "them", text: "Sounds good! I'll see you then." },
        // Add more messages to test scrolling on the right side
        {
            id: 6,
            sender: "me",
            text: "By the way, did you see the latest design mockups? I think they look great.",
        },
        {
            id: 7,
            sender: "them",
            text: "I did! The new color palette is much better. Great work.",
        },
        { id: 8, sender: "me", text: "Awesome, glad you like them." },
        { id: 9, sender: "them", text: "Talk to you tomorrow!" },
        { id: 10, sender: "me", text: "You too!" },
        {
            id: 11,
            sender: "them",
            text: "One more thing - can you add Bob to the calendar invite?",
        },
        { id: 12, sender: "me", text: "Sure thing, will do now." },
    ],
    2: [
        { id: 1, sender: "them", text: "Morning! Just checking in." },
        { id: 2, sender: "them", text: "Can you send over the file?" },
    ],
    3: [
        /* ... */
    ],
    4: [
        /* ... */
    ],
    5: [
        /* ... */
    ],
    6: [
        /* ... */
    ],
};

export function ChatPage() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
        });
        socket.on("message", (data) => {
            setLastMessage(data);
        });
    }, []);

    const [activeConversationId, setActiveConversationId] = useState<
        number | null
    >(1);
    const [newMessage, setNewMessage] = useState<string>("");

    const activeConversation = mockConversations.find(
        (c) => c.id === activeConversationId
    );
    const messages: Message[] = activeConversationId
        ? mockMessages[activeConversationId]
        : [];

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;
        setNewMessage("");
    };

    return (
        <div className="container mx-auto px-3 max-w-7xl h-screen flex flex-col">
            <div className="flex flex-col lg:flex-row gap-8 flex-grow min-h-0 py-8">
                {/* Left Column: Defined width, will stretch vertically */}
                <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                    <Card className="rounded-lg shadow-sm h-full flex flex-col">
                        <CardHeader className="p-4 border-b">
                            <h2 className="text-2xl font-bold">Chats</h2>
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search messages..."
                                    className="pl-9"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow overflow-y-auto">
                            <div className="space-y-1">
                                {mockConversations.map((convo) => (
                                    <Button
                                        key={convo.id}
                                        variant="ghost"
                                        className={`w-full justify-start h-20 p-4 rounded-none ${
                                            activeConversationId === convo.id
                                                ? "bg-muted"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActiveConversationId(convo.id)
                                        }
                                    >
                                        <div className="flex items-center space-x-4 w-full">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={convo.avatarUrl}
                                                    alt={convo.name}
                                                />
                                                <AvatarFallback>
                                                    {convo.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left w-full overflow-hidden">
                                                <p className="font-semibold truncate">
                                                    {convo.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {convo.lastMessage}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 self-start pt-1">
                                                {convo.timestamp}
                                            </p>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Grows to fill remaining space */}
                <div className="w-full flex-grow">
                    {activeConversation ? (
                        <Card className="rounded-lg shadow-sm h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={activeConversation.avatarUrl}
                                            alt={activeConversation.name}
                                        />
                                        <AvatarFallback>
                                            {activeConversation.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-lg font-semibold">
                                            {activeConversation.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Online
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow p-6 space-y-6 overflow-y-auto">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex items-end gap-2 ${
                                            msg.sender === "me"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        {msg.sender === "them" && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={
                                                        activeConversation.avatarUrl
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {activeConversation.name.charAt(
                                                        0
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${
                                                msg.sender === "me"
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted rounded-bl-none"
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="p-4 border-t bg-background ">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center w-full space-x-2"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                    >
                                        {" "}
                                        <Paperclip className="h-5 w-5" />{" "}
                                    </Button>
                                    <Input
                                        placeholder="Type a message..."
                                        className="flex-grow"
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        autoComplete="off"
                                    />
                                    <Button type="submit" size="icon">
                                        {" "}
                                        <Send className="h-5 w-5" />{" "}
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
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

export default ChatPage;
