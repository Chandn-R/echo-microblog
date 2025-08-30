import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { Conversation, User } from "./ChatPage";

interface ChatListProps {
  conversations: Conversation[];
  activeConversationId: string | null | undefined;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
}

// Helper to get the other user in a 1-on-1 chat
const getOtherUser = (users: User[], currentUser: User) => {
    return users.find(u => u._id !== currentUser._id);
}

export function ChatList({
  conversations,
  activeConversationId,
  onSelectConversation,
  loading,
}: ChatListProps) {
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
        
        {loading ? (
            <div className="p-2 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((convo) => {
                const displayName = convo.isGroupChat ? convo.chatName : getOtherUser(convo.users, /* pass current user here */)?.name;
                const displayAvatar = convo.isGroupChat ? `https://i.pravatar.cc/150?u=${convo._id}` : getOtherUser(convo.users, /* pass current user here */)?.profilePicture.secure_url;
                
                return (
                    <Button
                        key={convo._id}
                        variant="ghost"
                        className={`w-full justify-start h-20 p-4 rounded-none ${
                            activeConversationId === convo._id ? "bg-muted" : ""
                        }`}
                        onClick={() => onSelectConversation(convo)}
                    >
                        {/* UI remains mostly the same, but uses real data */}
                        <div className="flex items-center space-x-4 w-full">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={displayAvatar} alt={displayName} />
                                <AvatarFallback>{displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left w-full overflow-hidden">
                                <p className="font-semibold truncate">{displayName}</p>
                                <p className="text-sm text-gray-500 truncate">{convo.latestMessage?.content}</p>
                            </div>
                        </div>
                    </Button>
                );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}