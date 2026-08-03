# Frontend Deployment Guide

The React application is fully configured for deployment on Vercel or Firebase Hosting.

## Vercel Deployment

1. **Connect Repository to Vercel:**
   * Sign in to [Vercel](https://vercel.com).
   * Click **New Project** and import the Github repository.
2. **Configure Build Settings:**
   * Root Directory: `frontend`
   * Framework Preset: **Vite**
   * Build Command: `npm run build`
   * Output Directory: `dist`
3. **Configure Environment Variables:**
   Add the following variables to matching credentials from your Firebase web app config:
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_APP_ID`
   * `VITE_API_BASE_URL` (Point this to your live FastAPI backend URL)
4. **Deploy:**
   Click **Deploy**. Vercel will automatically configure rewrite rules according to the rules defined in `vercel.json` to properly serve the single-page application (SPA).
