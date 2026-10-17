
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routes import auth, events, ticket_tiers, bookings, tickets


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="EventMesh API",
    description="Backend API for the EventMesh event management system",
    version="1.0.0",
)


# CORS configuration
# Local development origins are used by default.
# Set CORS_ORIGINS in the hosting environment for production.
frontend_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

allowed_origins = [
    origin.strip()
    for origin in frontend_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(ticket_tiers.router)
app.include_router(bookings.router)
app.include_router(tickets.router)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "EventMesh API is running"
    }
