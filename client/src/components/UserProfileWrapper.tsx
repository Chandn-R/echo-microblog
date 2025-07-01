import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { UserProfile } from "@/pages/UserProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileProps {
  _id: string;
  name: string;
  username: string;
  email: string;
  followers: Array<{
    _id: string;
    name: string;
    username: string;
    profilePicture?: {
      secure_url: string;
    };
  }>;
  following: Array<{
    _id: string;
    name: string;
    username: string;
    profilePicture?: {
      secure_url: string;
    };
  }>;
  bio: string;
  profilePicture?: {
    secure_url: string;
  };
  posts: Array<{
    _id: string;
    user: string;
    content: Array<{
      type: "text" | "image";
      value: string;
      public_id?: string;
    }>;
    likes: Array<string>;
    comments: Array<string>;
    createdAt: string;
    updatedAt: string;
  }>;

  createdAt: string;
  updatedAt: string;
  isFollowing: boolean;
}

export const UserProfileWrapper = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfileProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setProfile(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen p-4 mx-auto max-w-xl space-y-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }
  if (!profile)
    return <p className="text-center text-red-500">Failed to load profile.</p>;

  return <UserProfile user={profile} />;
};
