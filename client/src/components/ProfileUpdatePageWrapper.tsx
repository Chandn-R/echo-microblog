import { useAuthStore } from "@/stores/authStore";
import { ProfileUpdate } from "@/pages/ProfileUpdate";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";

interface FullUserProfile {
  _id: string;
  username: string;
  name: string;
  email:string;
  bio?: string;
  profilePicture?: {
    secure_url: string;
    public_id: string;
  };
  followers?: string[];
  following?: string[];
  createdAt?: string;
  updatedAt?: string;
  isFollowing?: boolean;
}

export const ProfileUpdatePageWrapper = () => {
  const { user, isLoggedIn } = useAuthStore();
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${user?._id}`);
        setProfile(res.data.data); // assuming backend returns profile in 'data'
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchProfile();
  }, [user?._id]);

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Failed to load profile</p>;

  return <ProfileUpdate user={profile} />;
};
