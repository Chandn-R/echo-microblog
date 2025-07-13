import http, { RefinedResponse } from "k6/http";
import { check, sleep } from "k6";
import { Options } from "k6/options";
import { Trend } from "k6/metrics";
export let responseTime = new Trend("response_time");

export const options: Options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 20 },

    { duration: "30s", target: 50 },
    { duration: "2m", target: 50 },

    { duration: "30s", target: 100 },
    { duration: "2m", target: 100 },

    { duration: "30s", target: 150 },
    { duration: "1m", target: 150 },

    { duration: "30s", target: 0 },
  ],
};

const BASE_URL = "http://:8000/api";
const PASSWORD = "password123";

interface LoginResponse {
  statusCode: number;
  data: {
    _id: string;
    username: string;
    email: string;
    name: string;
    accessToken: string;
  };
  message: string;
  success: boolean;
}
const binFile = open("./chandan.png", "b");

export default function (): void {
  const email = `testuser${__VU}@example.com`;

  // Login Request
  const loginRes: RefinedResponse<any> = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );
  responseTime.add(loginRes.timings.duration);

  check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  const responseBody = loginRes.json() as unknown as LoginResponse;
  const token = responseBody.data.accessToken;

  // Fetch Posts
  const postsRes = http.get(`${BASE_URL}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  responseTime.add(postsRes.timings.duration);

  check(postsRes, {
    "fetched posts": (r) => r.status === 200,
  });

  // Create Post

  const formData = {
    "content[0][type]": "text",
    "content[0][value]": "Post by test user",
    "content[1][type]": "text",
    "content[1][value]": "More random content",
    "content[2][type]": "image",
    "content[2][value]": http.file(binFile, "photo.png", "image/png"),
  };
  const postRes = http.post(`${BASE_URL}/posts`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  responseTime.add(postRes.timings.duration);

  check(postRes, {
    "post created": (r) => r.status === 201,
  });

  // Fetch Profile
  const profileRes = http.get(`${BASE_URL}/users/${responseBody.data._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  responseTime.add(profileRes.timings.duration);

  check(profileRes, {
    "fetched profile": (r) => r.status === 200,
  });

  sleep(1);
}
