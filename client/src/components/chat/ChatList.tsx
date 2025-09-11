import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { Conversation, User } from "./ChatPage";
import { useAuth } from "@/context/AuthContext";

interface ChatListProps {
    conversations: Conversation[];
    activeConversationId: string | null | undefined;
    onSelectConversation: (conversation: Conversation) => void;
    loading: boolean;
}

const getOtherUser = (users: User[], currentUser: User) => {
    return users.find((u) => u._id !== currentUser._id);
};

export function ChatList({
    conversations,
    activeConversationId,
    onSelectConversation,
    loading,
}: ChatListProps) {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="p-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            );
        }

        if (conversations.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-500">
                        No conversations yet.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-1">
                {conversations.map((convo) => {
                    const otherUser = convo.isGroupChat
                        ? null
                        : getOtherUser(convo.users, user);

                    const displayName = convo.isGroupChat
                        ? convo.chatName
                        : otherUser?.name;

                    const displayAvatar = convo.isGroupChat
                        ? `https://api.dicebear.com/8.x/initials/svg?seed=${convo.chatName}` // A better placeholder
                        : otherUser?.profilePicture?.secure_url;

                    return (
                        <Button
                            key={convo._id}
                            variant="ghost"
                            className={`w-full justify-start h-20 p-4 rounded-none ${
                                activeConversationId === convo._id
                                    ? "bg-muted"
                                    : ""
                            }`}
                            onClick={() => onSelectConversation(convo)}
                        >
                            <div className="flex items-center space-x-4 w-full">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={displayAvatar}
                                        alt={displayName ?? "Chat"}
                                    />
                                    <AvatarFallback>
                                        {displayName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left w-full overflow-hidden">
                                    <p className="font-semibold truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {convo.latestMessage?.content}
                                    </p>
                                </div>
                            </div>
                        </Button>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className="rounded-lg shadow-sm h-full flex flex-col">
            <CardHeader className="p-4 border-b">
                <h2 className="text-2xl font-bold">Chats</h2>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="Search messages..." className="pl-9" />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-y-auto">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
