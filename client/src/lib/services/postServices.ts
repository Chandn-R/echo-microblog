import { api } from "@/lib/api";

export const createPost = async () => {
  const response = await api.post("/posts");
  return response.data;
};
