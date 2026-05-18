# 🚀 Online Hosting Guide: AI Quiz Generator

This guide provides step-by-step instructions to host the **AI-Driven Quiz Generation from Presentation Slides** application online. 

By the end of this guide, your React frontend will be live (e.g., on Vercel or Render) and communicating securely with your Dockerized FastAPI backend (hosted on Render or Railway).

---

## 🏛️ Deployment Architecture Overview

To achieve premium performance, cost-efficiency (completely free/extremely cheap), and full compatibility with system packages like OCR and PyMuPDF, we use a **decoupled architecture**:

```mermaid
graph TD
    User([User's Browser]) -->|Loads Frontend| StaticHost[Frontend Host: Vercel or Render Static]
    User -->|API Requests: Upload/Generate| BackendContainer[Backend Container: Render or Railway]
    BackendContainer -->|Text & Image OCR| Tesseract[Tesseract OCR (Docker Built-in)]
    BackendContainer -->|Quiz Generation| GeminiAPI[Google Gemini API]
    BackendContainer -->|Forms Export| GoogleFormsAPI[Google Forms API]
```

1. **Frontend (Vite + React + Tailwind)**: Hosted as a **Static Site** on Vercel, Netlify, or Render. (100% Free, blazing fast, with automated SSL).
2. **Backend (FastAPI + Python)**: Hosted as a **Docker Container** on Render or Railway. 
   > [!IMPORTANT]
   > Because the backend requires system packages (`tesseract-ocr` and OpenCV drivers), it **must** be deployed using the `Dockerfile` inside the `/backend` folder. Traditional serverless options (like standard Vercel Python functions) do not support Tesseract OCR.
3. **Storage (Local `/uploads` and `/db`)**: Since container clouds have **ephemeral filesystems** (files wipe on server restart/spin-down), we provide options for persistent storage (e.g., Render Disks or Railway Volumes).

---

## 📋 Prerequisites

Before starting, make sure you have:
1. A **GitHub** account.
2. A **Google Gemini API Key** (already in your `.env`).
3. An account on **Render** ([render.com](https://render.com)) and/or **Railway** ([railway.app](https://railway.app)).
4. An account on **Vercel** ([vercel.com](https://vercel.com)) *(optional, recommended for frontend)*.

---

## 🛠️ Step 1: Prep and Push to GitHub

Initialize Git (if not already done) and push your project to a **private** GitHub repository to keep your environment variables and files secure.

### Create a `.gitignore`
Ensure you have a `.gitignore` in your root folder so you don't leak local development files to GitHub.
```gitignore
# Python
backend/venv/
backend/.venv/
backend/__pycache__/
backend/server.log
backend/server_output.log

# Node (Frontend)
frontend/node_modules/
frontend/dist/

# Local database & uploaded slide uploads
backend/uploads/*
!backend/uploads/.gitkeep
backend/db/*
!backend/db/.gitkeep

# Sensitive Google Forms credentials (will be supplied via Env variables in production!)
backend/credentials.json
backend/token.json
backend/.env
```

---

## ⚙️ Step 2: Deploying the Backend (FastAPI via Docker)

Choose either **Render** (completely free, but sleeps after inactivity) or **Railway** (ultra-fast, supports easy disks, small monthly free credit/developer pricing).

### Option A: Hosting on Render (Free Tier)
1. Log in to [Render Console](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration parameters:
   - **Name**: `quiz-generator-backend`
   - **Root Directory**: `backend` *(CRITICAL: Tell Render to look inside the backend directory)*
   - **Language**: `Docker` *(Render will automatically discover the Dockerfile)*
   - **Branch**: `main` (or your active branch)
   - **Region**: Choose the region closest to your users.
   - **Instance Type**: `Free` or `Starter`
5. Click **Advanced** and add the following **Environment Variables**:
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `GOOGLE_TOKEN_JSON`: `contents_of_your_local_token_json_file` *(See details below)*
6. Click **Deploy Web Service**.

> [!NOTE]
> **What is `GOOGLE_TOKEN_JSON`?**
> Since your backend is running in a headless Docker cloud container, it cannot open a browser window to authenticate with Google. 
> To bypass this, run the app **locally** on your desktop once, export to Google Forms to generate the `token.json` file inside your `/backend` folder, and copy the **entire text contents** of that file. 
> Paste it as the value of the `GOOGLE_TOKEN_JSON` environment variable in Render. The backend will automatically write this value to `token.json` when starting up!

> [!WARNING]
> **Render Free Tier Storage Notice**:
> Render's Free tier spins down containers after 15 minutes of inactivity, wiping the local filesystem. This is perfectly fine for live demos, as a user uploads a document, generates a quiz, and exports it in a single active session. 
> If you want persistent history across backend restarts, upgrade to Render's **Starter** tier ($7/month) and attach a **Render Disk** (Volume) to mount at `/app/db` and `/app/uploads` (Size: 1GB, cost: $1/month).

---

### Option B: Hosting on Railway (Recommended for Docker Apps)
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Click **Variables** on the newly created service and add:
   - `PORT`: `8000`
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `GOOGLE_TOKEN_JSON`: `contents_of_your_local_token_json_file`
5. Click **Settings** and:
   - Under **Build**, verify the Root Directory is set to `/backend`. Railway will build the `Dockerfile` automatically.
   - Under **Networking**, click **Generate Domain** to get your public backend URL (e.g. `https://backend-production-xxx.up.railway.app`).
6. *(Optional but Recommended)* Add a **Volume**:
   - In your Railway project dashboard, click **+ New** -> **Volume**.
   - Attach it to your backend service and set the Mount Path to `/app/db` and `/app/uploads`. This keeps all uploaded presentations and generated quizzes safe forever!

---

## 🎨 Step 3: Deploying the Frontend (React Vite App)

Once your backend is successfully deployed, copy its public URL (e.g., `https://quiz-generator-backend.onrender.com`).

### Option A: Hosting on Vercel (Recommended - Fastest and Easiest)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Root Directory**: `frontend` *(CRITICAL: Tell Vercel to build the frontend folder)*
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `https://quiz-generator-backend.onrender.com` *(Use your actual hosted backend URL here, without the trailing slash!)*
6. Click **Deploy**. Vercel will build your static files and give you a beautiful domain (e.g. `https://quiz-generator-frontend.vercel.app`).

### Option B: Hosting on Render (Free Static Site)
1. Log in to your Render dashboard.
2. Click **New +** and select **Static Site**.
3. Connect your GitHub repository.
4. Set the configuration:
   - **Name**: `quiz-generator-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add the **Environment Variable**:
   - `VITE_API_URL`: `https://quiz-generator-backend.onrender.com`
6. Click **Create Static Site**.

---

## 🧪 Step 4: Testing Your Deployed App

1. Visit your live frontend URL.
2. Drag and drop a presentation file (`.pptx` or `.pdf`).
3. You should see the progress bar run, sending the file to the hosted FastAPI server.
4. Choose **Teacher** or **Student** mode.
5. Generate the quiz.
6. Try exporting:
   - Click **Export PDF** or **Export Word**—these are created dynamically on the backend and downloaded to your computer!
   - Click **Google Form**—the backend will use the `GOOGLE_TOKEN_JSON` environment variable to create the Google Form in your drive and return a shareable URL instantly!

---

## 💡 Troubleshooting & Enterprise Optimization

### 1. The frontend shows a network connection error
*   **Cause**: The backend URL in `VITE_API_URL` is wrong, or the backend is still spinning up (Render's free tier takes ~50 seconds to boot up after sleeping).
*   **Fix**: Check your Vercel deployment variables, restart backend services, and inspect your browser's Developer Tools Console (F12) to see where requests are pointing.

### 2. Google Form Export errors out in production
*   **Cause**: `GOOGLE_TOKEN_JSON` is missing, expired, or incorrect, or your Google Console App credentials do not have the proper scope permissions.
*   **Fix**: 
    1. Authenticate locally on your desktop to refresh the token and verify it creates forms.
    2. Open `/backend/token.json` locally and ensure the contents are correct.
    3. Update the `GOOGLE_TOKEN_JSON` environment variable in your cloud platform with the new token text.

### 3. KeyBERT or NLP models are too slow / timeout
*   **Explanation**: KeyBERT uses lightweight sentence-transformers, which might download on first run inside Docker. On Render's Free tier, resources are restricted (512MB RAM), which might cause minor delays during the first generation. 
*   **Optimization**: Consider upgrading to a 1GB RAM instance on Render ($7/m) or Railway ($1-$2/m depending on use) to ensure rapid, sub-second responses.
