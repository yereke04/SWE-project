# Supplier-Consumer Platform (SCP) 🛒🏢

A scalable, secure B2B platform designed to centralize catalog management, ordering, real-time communication, and issue handling between institutional consumers and certified food suppliers.

## 📑 Project Overview

Currently, communication between food suppliers and institutional consumers is scattered across phone calls, messaging apps, and spreadsheets. SCP replaces this fragmented workflow with a centralized, mobile-friendly multi-tier system. It enforces link-based access, meaning only pre-approved supplier-consumer relationships can interact, ensuring secure and private B2B commerce.

**Key Features:**

* **Role-Based Access Control (RBAC):** Distinct system interfaces and permissions tailored for Consumers, Owners, Managers, Platform Admins, and Sales Representatives.
* **Catalog & Pricing Management:** Suppliers can securely manage their inventory, update pricing dynamically, and monitor stock quantities.
* **End-to-End Order Processing:** Full lifecycle tracking from initial order submission and stock validation to final dispatch and fulfillment.
* **Real-Time Communication:** Integrated chat module allowing for direct, secure supplier-buyer messaging.
* **Incident Management:** Built-in complaint ticketing system for structured issue resolution and auditing.

## 🏗️ System Architecture

The platform is built on a **multi-tier client-server design**:

* **Database:** Centralized **PostgreSQL** database handling complex relational data (Users, Orders, Products, Chat, Complaints).
* **Backend:** Containerized **REST API** backend that securely encapsulates all core business logic and routing via HTTPS.
* **Web Client:** A modern Single Page Application (SPA) dashboard tailored for Administrators and Suppliers (focusing on catalog management and incident handling).
* **Mobile Client:** A cross-platform mobile application (Flutter / React Native) optimized for Consumers and Sales Reps to handle on-the-go ordering and push notifications.

### This repository (MVP implementation)

| Layer | Technology in this repo |
|-------|-------------------------|
| **Database** | SQLite (`backend/production.db`) — PostgreSQL-ready via `DATABASE_URL` |
| **Backend** | Python **FastAPI** + Uvicorn (`backend/`) |
| **Web client** | **Vite + React** merchant dashboard (`frontend/`) |
| **Mobile client** | **Expo / React Native** buyer app (`mobile/`) |

```
┌─────────────┐     ┌─────────────┐
│  frontend   │     │   mobile    │
│  (merchant) │     │   (buyer)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 ▼
         ┌───────────────┐
         │    backend    │
         │  FastAPI :8000│
         └───────────────┘
```

## 📊 Documentation & System Modeling

This project was developed using a strict requirements-driven methodology based on a formal Software Requirements Specification (SRS). Comprehensive UML modeling was utilized to design the architecture, including:

* **ERD (Entity-Relationship Diagram):** Mapping the core PostgreSQL schema and foreign key relationships.
* **Component Diagram:** Illustrating the dependencies between the frontend apps, API Gateway, core microservices, and database.
* **Activity & Sequence Diagrams:** Documenting the dynamic workflow of order processing, stock validation, and state updates.
* **Use Case & Class Diagrams:** Defining the static structure and user interactions across the entire platform ecosystem.

## 🚀 Future Roadmap

The current MVP successfully validates the core workflows on both web and mobile. Planned architectural extensions include:

* Integration of an external Payment Gateway.
* Advanced Analytics Dashboard for sales forecasting.
* AI-driven features for automated order suggestions and anomaly detection.
* Logistics and delivery tracking modules.

## 👨‍💻 Development

Developed in a cross-functional team of 4 as part of a Software Engineering architecture track, focusing on database design and backend REST API routing.

---

## Getting started

### Prerequisites

- Python 3.11+ (tested on 3.13)
- [Node.js](https://nodejs.org/) 20+ (for frontend and mobile)
- Optional: Expo Go app on your phone

### 1. Backend (required first)

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://127.0.0.1:8000/docs  
Health check: http://127.0.0.1:8000/health

Run automated tests:

```powershell
cd backend
python -m pytest tests/test_main.py -v
```

Live smoke test (with server running):

```powershell
cd backend
python scripts/smoke_test.py
```

### 2. Frontend (merchant portal)

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

1. Register a **merchant** account
2. Add inventory under **Inventory**
3. Use **Settings** to toggle marketplace visibility (public by default for new merchants)
4. Accept buyer partnership requests under orders/partnerships flow

The frontend talks to `http://localhost:8000` (see `frontend/src/services/client.js`).

### 3. Mobile (buyer app)

```powershell
cd mobile
npm install
npx expo start
```

**API URL**

| Where you run the app | Backend URL |
|----------------------|-------------|
| iOS simulator / web | `http://127.0.0.1:8000` (default) |
| Android emulator | `http://10.0.2.2:8000` (default) |
| Physical phone | Your PC's LAN IP, e.g. `http://192.168.1.100:8000` |

For a physical device, copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL`.

**Typical buyer flow**

1. Register as **buyer** in the mobile app
2. Discover merchants on the home tab (merchants must be public)
3. Send a partnership request
4. Merchant accepts on the web dashboard
5. Browse catalog and place orders

## Troubleshooting

- **Mobile cannot connect** — Backend must listen on `0.0.0.0`, phone and PC on same Wi‑Fi, use LAN IP in `mobile/.env`.
- **Empty merchant list on mobile** — Register a merchant on the web app; new merchants are public by default.
- **Orders fail** — Buyer needs an **active** partnership with the merchant before ordering.
- **npm not found** — Install Node.js and restart the terminal.
