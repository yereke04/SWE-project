import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import Base, get_db

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import from your new structure

# --- Test Database Setup ---
# Use an in-memory SQLite database for testing so we don't break the real one
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the 'get_db' dependency in the app to use our test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Setup: Drop and Create Tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Global vars to store IDs between tests
merchant_token = None
buyer_token = None
merchant_id = None
product_id = None

def test_1_register_merchant():
    global merchant_id
    # New Route: /api/v1/auth/signup
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "merchant@global.com",
            "password": "securepassword",
            "full_name": "Global Traders",
            "role": "merchant_admin"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "merchant@global.com"
    merchant_id = data["id"]

def test_2_login_merchant():
    global merchant_token
    # New Route: /api/v1/auth/login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "merchant@global.com", "password": "securepassword"}
    )
    assert response.status_code == 200
    merchant_token = response.json()["access_token"]

def test_3_create_inventory_item():
    global product_id
    headers = {"Authorization": f"Bearer {merchant_token}"}
    # New Payload matching schemas.ProductCreate
    payload = {
        "name": "Premium Widget",
        "price": 25.00,
        "stock": 50,
        "unit_type": "box"
    }
    # New Route: /inventory/
    response = client.post("/inventory/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Premium Widget"
    product_id = data["id"]

def test_4_register_and_login_buyer():
    global buyer_token
    # Register Buyer
    client.post(
        "/api/v1/auth/signup",
        json={
            "email": "buyer@local.com",
            "password": "buyerpassword",
            "full_name": "Local Store",
            "role": "buyer"
        }
    )
    # Login Buyer
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "buyer@local.com", "password": "buyerpassword"}
    )
    assert response.status_code == 200
    buyer_token = response.json()["access_token"]

def test_5_establish_partnership():
    # CRITICAL: The new system requires a partnership before ordering
    headers = {"Authorization": f"Bearer {buyer_token}"}
    
    # 1. Request Partnership
    response = client.post(
        "/merchants/partnerships", 
        json={"merchant_id": merchant_id}, 
        headers=headers
    )
    assert response.status_code == 200
    link_id = response.json()["id"]

    # 2. Merchant Accepts Partnership
    merchant_headers = {"Authorization": f"Bearer {merchant_token}"}
    response = client.put(
        f"/merchants/partnerships/{link_id}",
        json={"status": "active"},
        headers=merchant_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "active"

def test_6_place_transaction():
    headers = {"Authorization": f"Bearer {buyer_token}"}
    payload = {
        "merchant_id": merchant_id,
        "items": [
            {"product_id": product_id, "quantity": 2}
        ]
    }
    # New Route: /transactions/
    response = client.post("/transactions/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    # 2 * 25.00 = 50.00
    assert data["total_value"] == 50.00
