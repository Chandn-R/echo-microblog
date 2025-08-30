// components/chat/ChatWindow.tsx
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageComponent } from "./Message";
import { MessageInput } from "./MessageInput";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMessages } from "@/services/api";
import type { Conversation, Message } from "./ChatPage"; // Import types
 // Import types
import { Socket } from "socket.io-client";

interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (messageText: string) => void;
  socket: Socket; // Pass the socket instance as a prop
}

export function ChatWindow({ conversation, onSendMessage, socket }: ChatWindowProps) {
  // --- Key Change: State for messages and loading specific to this window ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Key Change: Fetch message history when conversation changes ---
  useEffect(() => {
    const getMessages = async () => {
      if (!conversation?._id) return;
      try {
        setLoading(true);
        const response = await fetchMessages(conversation._id);
        setMessages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    getMessages();
  }, [conversation._id]);

  // --- Key Change: Listen for incoming messages on the socket ---
  useEffect(() => {
    const handleNewMessage = (newMessage: Message) => {
        // Only add message if it belongs to the currently active chat
        if (newMessage.chat._id === conversation._id) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        }
    };

    socket.on("receiveMessage", handleNewMessage);
    return () => {
        socket.off("receiveMessage", handleNewMessage);
    };
  }, [socket, conversation._id]);


  // Effect to scroll to the bottom when new messages are added
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="rounded-lg shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
         {/* UI remains the same, but uses real data */}
      </CardHeader>
      <CardContent className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* --- Key Change: Handle loading state for messages --- */}
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
              // Pass the current user ID to determine if sender is "me"
              currentUserId={/* pass current user ID here */} 
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