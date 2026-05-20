from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, merchant, inventory, orders, communication

# Create Tables (In production, use Alembic for migrations instead)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise Commerce API", 
    description="Refactored System for B2B Operations",
    version="3.0.0"
)

# CORS Config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(merchant.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(communication.router)

@app.get("/health")
def health_check():
    return {"system_status": "operational"}
