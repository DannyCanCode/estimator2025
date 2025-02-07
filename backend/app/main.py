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
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(pdf.router, prefix="/api", tags=["pdf"])
app.include_router(estimate.router, prefix="/api", tags=["estimate"])

@app.get("/")
async def root():
    return {"message": "Welcome to 3MG Roofing Estimator API"} 