# 🎓 Tecnophite Registration Portal

A full-stack web application for managing event registrations at the Tecnophite tech fest. Features a **Student Portal** for browsing and registering for events, and an **Admin Portal** for managing events, registrations, and association members.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite), Tailwind CSS, React Router, Axios |
| **Backend** | FastAPI (Python), Uvicorn, Pydantic |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Authentication |
| **Storage** | Firebase Storage |
| **Deployment** | Frontend on Vercel · Backend on Render |

---

## 📁 Project Structure

```
tecnophite-portal/
├── frontend/          # React.js SPA
├── backend/           # FastAPI REST API
├── docs/              # Documentation
└── .github/           # CI/CD Workflows
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **Firebase Project** with Auth, Firestore, and Storage enabled

### Frontend

```bash
cd frontend
npm install
cp .env.example .env     # Fill in your Firebase config
npm run dev              # Starts on http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt
cp .env.example .env     # Fill in your Firebase Admin credentials
uvicorn app.main:app --reload  # Starts on http://localhost:8000
```

---

## 📚 Documentation

See the [`docs/`](./docs/) folder for:
- API Reference
- Database Schema & ER Diagram
- Setup & Deployment Guides
- UI Flow Diagrams

---

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Emergency production fixes |

---

## 📝 License

This project is for educational purposes.
