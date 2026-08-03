# Backend Deployment Guide

The FastAPI server can be deployed on Render, Railway, or standard Docker hosts.

## Render Deployment

1. **Create Web Service:**
   * Sign in to [Render](https://render.com).
   * Click **New +** -> **Web Service**.
   * Connect your GitHub repository.
2. **Configure Settings:**
   * Root Directory: `backend`
   * Runtime: **Python**
   * Build Command: `pip install -r requirements.txt`
   * Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Configure Environment Variables:**
   Under **Advanced**, click **Add Environment Variable** and fill in details:
   * `APP_ENV`: `production`
   * `DEBUG`: `false`
   * `FIREBASE_PROJECT_ID`: (Your Firebase Project ID)
   * `FIREBASE_PRIVATE_KEY`: (Your Service account private key wrapped in quotes, with literal newline characters replaced)
   * `FIREBASE_CLIENT_EMAIL`: (Your Firebase SDK client email address)
   * `CORS_ORIGINS`: (List of allowed clients, e.g., your Vercel URL)
4. **Click Deploy.** Render will start the Uvicorn worker and expose a live public URL.
