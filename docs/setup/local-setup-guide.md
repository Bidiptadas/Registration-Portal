# Local Setup Guide

Follow these steps to run the Tecnophite Registration Portal on your local developer workstation.

## 1. Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```
2. **Create Python virtual environment:**
   ```bash
   python -m venv venv
   ```
3. **Activate environment:**
   * PowerShell: `.\venv\Scripts\activate`
   * Git Bash / Linux: `source venv/bin/activate`
4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```
5. **Configure environment variables:**
   * Copy `.env.example` to `.env`
   * Obtain service account credentials from Firebase console (Project settings -> Service accounts -> Python)
   * Place the credentials in `.env` or save the JSON file as `firebase-service-account.json` in backend root.
6. **Start development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## 2. Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```
2. **Install node packages:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   * Copy `.env.example` to `.env`
   * Configure project keys from Firebase console (Project settings -> General -> Web Apps -> SDK configuration)
4. **Start Vite server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
