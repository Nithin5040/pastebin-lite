# Pastebin-Lite

A small "Pastebin"-like application built with Next.js. This project allows users to create text pastes with optional constraints like time-based expiry (TTL) and view-count limits.

## 🚀 Features

* **Create Pastes**: Users can submit arbitrary text and receive a shareable URL.
* **Optional Constraints**: Supports time-based expiry (TTL) and maximum view limits.
* **Automatic Unavailability**: Pastes become inaccessible as soon as a constraint is triggered (404 response).
* **Safe Rendering**: All paste content is rendered safely to prevent script execution.
* **Deterministic Testing**: Supports the `x-test-now-ms` header for accurate expiry testing in `TEST_MODE`.

## 🛠 Persistence Layer

This application uses **Upstash Redis** as its persistence layer. 
Redis was chosen because:
1. It provides shared state that survives across requests in a serverless environment like Vercel.
2. It offers high performance for quick health checks and API responses.
3. Its native TTL capabilities complement the application's expiry logic.

##  Local Setup

Follow these steps to run the project locally:

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd pastebin-lite
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your Upstash credentials:
    ```env
    UPSTASH_REDIS_REST_URL=your_https_url
    UPSTASH_REDIS_REST_TOKEN=your_token
    TEST_MODE=1
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Access the app**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

# 📡 API Endpoints

* [cite_start]`GET /api/healthz`: Returns application health status.
* `POST /api/pastes`: Create a new paste.
* `GET /api/pastes/:id`: Retrieve paste metadata and content (counts as a view).
* `GET /p/:id`: View the paste in HTML format.