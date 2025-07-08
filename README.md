# Echo – Scalable Social Media Backend

> A production-grade, containerized, and performance-tested backend powering a social media platform supporting rich posts (text + images), user auth, profiles, and feed timelines. Built for scale and extensibility.

---

## 🛠️ Tech Stack

- **Node.js** + **Express.js**
- **TypeScript**
- **MongoDB Atlas** (Cloud DB)
- **JWT Authentication**
- **Cloudinary** (Image uploads)
- **Multer** (Multi-part form data parsing)
- **Docker** (Multi-stage build)
- **Amazon ECS (Fargate)** – container orchestration
- **K6** – Load & performance testing

---

## 🧩 Features

- ✅ User authentication (JWT-based)
- ✅ Create rich posts (text & images in order)
- ✅ Profile retrieval
- ✅ Feed endpoint with pagination
- ✅ Cloud image storage (Cloudinary)
- ✅ Fully Dockerized & CI-ready
- ✅ K6 performance tests with custom scenarios
- ✅ ECS-optimized for container deployment

---

## ⚙️ Architecture

```

Client
|
v
\[REST API Server: Express.js (TypeScript)]
|
\|--- Auth (JWT)
\|--- Posts (rich content: text/image blocks)
\|--- User Profile
|
\|---> MongoDB Atlas (data)
\|---> Cloudinary (images)

````

### Content Schema Example:
```ts
content: [
  { type: 'text', value: 'Hello world' },
  { type: 'image', value: 'https://res.cloudinary.com/...' }
]
````

---

## 🚀 Getting Started

### 🧪 Run Locally

#### 1. Clone & Install

```bash
git clone https://github.com/yourusername/echo-backend.git
cd echo-backend
npm install
```

#### 2. Setup Environment

Create a `.env` file in root:

```
PORT=8000
MONGODB_URI=your_mongo_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

#### 3. Run Dev Server

```bash
npm run dev
```

---

## 🐳 Docker

### Build & Run Container

```bash
# Build
docker build -t cndn/echo-backend .

# Run
docker run -p 8000:8000 --env-file .env cndn/echo-backend
```

---

## 🧪 Load Testing (K6)

### Scenario:

Simulates 100 virtual users for 2 minutes:

```bash
k6 run test.js
```

Example K6 flow:

* Login
* Fetch feed
* Create post (with text + image)
* Fetch profile

See [`test.js`](./test.js) for script.

---

## 🧱 Deployment

### 🚢 ECS (Fargate)

* Container image hosted on **Docker Hub**
* Task definition uses public image
* Security group allows port `8000`
* VPC with public subnet
* Tested on 1 vCPU / 3GB RAM instance

---

## 📊 Performance

### Monolithic Load Test Results (K6, 100 VUs)

* Avg RPS: \~50/s
* Avg Latency: \~1.6s
* Success Rate: 100%
* Uploads: Cloudinary stable under load
* Memory Footprint: < 300MB/container

> Microservices refactor in progress for horizontal scaling and modularity.

---

## 📌 Roadmap

* [x] Image + Text block post support
* [x] Dockerized backend
* [x] ECS deployment with public image
* [x] Load testing with K6
* [ ] Refactor to microservices (Post / User / Auth / Media)
* [ ] Add Redis caching
* [ ] Add Observability (Prometheus + Grafana)
* [ ] CI/CD via GitHub Actions

---

## 🧠 Design Decisions

| Area          | Choice                            | Reason                                                       |
| ------------- | --------------------------------- | ------------------------------------------------------------ |
| Image Uploads | Cloudinary                        | Fast CDN, scalable, and direct support for buffer uploads    |
| MongoDB       | Atlas (Cloud DB)                  | Managed DB, high availability, easy to scale                 |
| Auth          | JWT                               | Stateless, scalable, and widely supported                    |
| Load Testing  | K6                                | Scripting-friendly, supports auth, uploads, and CI pipelines |
| Docker        | Multi-stage build, Alpine variant | Smaller image size, faster deploys                           |

---

## 🧑‍💻 Author

**Chandan Chandan**

> B.Tech CS | MERN & Backend Dev | AWS & DevOps Enthusiast
> [LinkedIn](https://linkedin.com/in/chandan--r)
