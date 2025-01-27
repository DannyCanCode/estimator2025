from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import pdf, estimate
import logging
from loguru import logger

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger.add(
    "logs/debug.log",
    format="{time} {level} {message}",
    level="DEBUG",
    rotation="1 day",
    retention="7 days",
    enqueue=True,
)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers without /api prefix since it's handled by Vite proxy
app.include_router(pdf.router, tags=["pdf"])
app.include_router(estimate.router, tags=["estimate"])

@app.get("/")
async def root():
    return {"message": "Welcome to 3MG Roofing Estimator API"} 