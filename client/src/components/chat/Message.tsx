import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageProps {
    message: {
        id: number;
        sender: "me" | "them";
        text: string;
    };
    senderInfo: {
        name: string;
        avatarUrl: string;
    };
}

export function Message({ message, senderInfo }: MessageProps) {
    const isMe = message.sender === "me";

    return (
        <div
            className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
            }`}
        >
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage
                        src={senderInfo.avatarUrl}
                        alt={senderInfo.name}
                    />
                    <AvatarFallback>{senderInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div
                className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${
                    isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                }`}
            >
                <p>{message.text}</p>
            </div>
        </div>
    );
}
