# San2Stic Collaborative Map & Radio

**San2Stic** is a collaborative field recording mapping application with live radio streaming.

## Architecture Overview

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Front-end  | React + Tailwind CSS + React-Leaflet       |
| Back-end   | Node.js + Express + Sequelize (PostgreSQL)  |
| Auth       | JWT + bcrypt                               |
| Storage    | Google Cloud Storage                       |
| Streaming  | Icecast                                    |
| Deployment | GCP Compute Engine / Static Hosting        |

## Directory Structure

```
.
├── backend/          # Express API
├── frontend/         # React app
├── infra/            # Docker & Icecast config
└── README.md         # This document
```

---

## Backend Setup

1. Copy `.env.example` to `.env` and fill your credentials.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:4000/api`.

## Frontend Setup

1. Copy/back to project root and install:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

The app runs at `http://localhost:3000` by default.

## Icecast Streaming

Launch your Icecast server using the provided config:
```
icecast -c infra/icecast.xml
```

## Deploy

You can containerize the backend with the included Dockerfile (`infra/Dockerfile.backend`), and deploy the React app on any static hosting.

---

_Generated scaffold for San2Stic collaborative map & radio application._