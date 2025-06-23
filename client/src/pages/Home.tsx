import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect } from "react";
import { MessageCircle, Send, Heart } from "lucide-react";

function Home() {
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  });

  return (
    <div className="flex-1 max-w-2xl min-h-screen p-4 space-y-4 mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((post) => (
        <Card
          key={post}
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src={`/avatars/user-${post}.png`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted">U{post}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      username_{post}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · 2h ago
                    </span>
                  </div>
                </div>

                <p className="text-sm">
                  This is a sample post content to represent a thread. It can be
                  multiline and contain more details. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit. Nullam euismod, nisl eget
                  aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl
                  nunc eu nisl.
                </p>

                <div className="flex justify-between pt-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-xs">24</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-blue-500"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">12</span>
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-green-500"
                    >
                      <Send className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
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
