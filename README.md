# SWE-project

Monorepo for the SWE project:

- **backend** — Python FastAPI API (SQLite)
- **frontend** — Merchant web dashboard (Vite + React)
- **mobile** — Buyer app (Expo / React Native)

## Prerequisites

- Python 3.11+ (tested on 3.13)
- [Node.js](https://nodejs.org/) 20+ (for frontend and mobile)
- Optional: Expo Go app on your phone

## Quick start

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

## Architecture

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

## Troubleshooting

- **Mobile cannot connect** — Backend must listen on `0.0.0.0`, phone and PC on same Wi‑Fi, use LAN IP in `mobile/.env`.
- **Empty merchant list on mobile** — Register a merchant on the web app; new merchants are public by default.
- **Orders fail** — Buyer needs an **active** partnership with the merchant before ordering.
- **npm not found** — Install Node.js and restart the terminal.
