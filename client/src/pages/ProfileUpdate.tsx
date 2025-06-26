import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

// Define User Type
interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: {
    secure_url: string;
  };
}

interface ProfileUpdatePageProps {
  user: User;
}

interface FormData {
  name: string;
  username: string;
  email: string;
  bio?: string;
}

export function ProfileUpdate({ user }: ProfileUpdatePageProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsUpdating(true);
      console.log("Profile updated:", data);
      // TODO: Call API to update profile
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex-1 min-h-screen p-4 mx-auto max-w-xl space-y-6">
      {/* Profile Card with Form & Logout */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-4 border-b">
          <h2 className="px-2 text-2xl font-semibold">Update Profile</h2>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.profilePicture?.secure_url}
                className="h-full w-full object-cover rounded-full"
                alt={user.username}
              />
              <AvatarFallback className="bg-muted text-2xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" type="button">
              Change Photo
            </Button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Name</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "name is required",
                  minLength: {
                    value: 3,
                    message: "name must be at least 3 characters",
                  },
                })}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.name?.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 flex-wrap">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUpdating}>
                {isSubmitting || isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
