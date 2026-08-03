"""
Tecnophite Registration Portal - FastAPI Backend Skeleton

This is a clean backend template for the backend developer to implement.
It includes CORS setup and a simple health endpoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Tecnophite Registration Portal API",
    description="API skeleton for Tecnophite Fest",
    version="1.0.0",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "API Skeleton is online"}
