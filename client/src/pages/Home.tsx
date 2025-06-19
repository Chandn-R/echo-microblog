import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MessageCircle, Send } from "lucide-react";

function Home() {
  return (
    <div className="flex-1 max-w-4xl min-h-screen p-4 space-y-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((post) => (
        <Card key={post} className="rounded-3xl">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={`/avatars/user-${post}.png`} />
                <AvatarFallback>U{post}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">username_{post}</span>
                  <span className="text-xs text-muted-foreground">
                    · 2h ago
                  </span>
                </div>
                <p className="mt-1 mb-3">
                  This is a sample post content to represent a thread. It can be
                  multiline and contain more details.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    24 replies
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Home;
