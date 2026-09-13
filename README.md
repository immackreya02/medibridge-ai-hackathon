# 🏥 MediBridge AI
### Agentic Healthcare Flow Orchestration & Patient Assistance System

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-green)](https://fastapi.tiangolo.com)
[![Agentic](https://img.shields.io/badge/Agentic-MediFlow_AI-purple)](https://github.com)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)](https://vitejs.dev)

---
        
## ⚡ What is MediBridge AI?

**MediBridge AI** is an **Agentic Healthcare Flow Orchestration System** designed to solve fragmented hospital coordination, OPD congestion, unpredictable bed availability, and referral delays.

Instead of merely displaying static data on a dashboard, ** MediBridge AI** operates as a goal-directed agent that autonomously retrieves network capacity, evaluates specialty match and proximity, verifies bed availability, adapts dynamically when a hospital becomes full, and requests human staff sign-off.

## 🚨 Problem & Solution

* **Problem**: Hospitals operate in silos. Critical patients face OPD congestion, unknown bed availability, and referral delays when a hospital unexpectedly runs out of beds.
* **Solution**: An AI agent that actively monitors network capacity, ranks hospitals by specialty and distance, verifies bed availability, and automatically re-plans alternative referrals upon capacity failure.


## 🎬 Live Hackathon Demo (5 Steps)

1. **Patient Goal**: Patient P-1024 (64yo, Acute Respiratory Distress) needs an urgent **Pulmonology** bed.
2. **Run MediFlow Decision**: Click **Run MediFlow Agent**. Agent retrieves metrics, ranks, and selects **City General Hospital** (4.2 km, 2 beds) $\rightarrow$ `VERIFIED RECOMMENDATION`.
3. **Simulate Hospital Failure**: Click **Simulate Hospital Failure**. City General capacity mutates to **0 beds / FULL (100% load)**.
4. **Agentic Adaptation**: Agent detects failure, invalidates City General, re-queries network, filters Pulmonology candidates (skips Community Centre which lacks Pulmonology), selects & verifies **Metro Care Hospital** (3 beds) $\rightarrow$ `UPDATED RECOMMENDATION`.
5. **Human Approval**: Click **Approve Referral** to issue official staff sign-off.

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)
```bash
cd medibridge/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
* API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite)
```bash
cd medibridge/frontend
npm install
npm run dev
```
* App URL: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🗂️ Project Structure

```
medibridge/
├── frontend/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MediFlowPage.jsx # 🌟 MediFlow AI Agentic Dashboard
│   │   │   ├── DashboardPage.jsx# Patient Health Dashboard
│   │   │   ├── ChatPage.jsx     # AI Symptom Assistant
│   │   │   ├── ReportAnalyzerPage.jsx # Medical Report Analyzer
│   │   │   └── DoctorPrepPage.jsx     # Consultation Prep
│   │   └── utils/
│   │       ├── api.js           # Axios REST API Client
│   │       └── translations.js  # Multilingual Translation Dictionaries
│
├── backend/                     # Python FastAPI Backend
│   ├── routers/
│   │   └── mediflow.py          # MediFlow REST Endpoints
│   ├── services/
│   │   ├── mediflow_agent.py    # Agent Controller & Re-planning Engine
│   │   └── mediflow_tools.py    # Deterministic Mock Tool Suite
│   └── main.py                  # FastAPI Application Entrypoint
│
├── ARCHITECTURE.md              # System Diagrams & Flow Logic
└── README.md                    # Setup & Documentation
```

---

## 🔬 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` | `/api/mediflow/state` | Get agent state, patient profile, tool logs & plan |
| `POST` | `/api/mediflow/run` | Execute initial goal-directed agent decision workflow |
| `POST` | `/api/mediflow/failure` | Trigger hospital failure & activate agent re-planning |
| `POST` | `/api/mediflow/approve` | Perform human-in-the-loop staff approval |
| `POST` | `/api/mediflow/reset` | Reset demo state for fresh presentation run |

---

## ⚠️ Medical Disclaimer
MediFlow AI is a decision-support prototype created for hackathon demonstration using simulated data. It does not provide automated medical diagnoses or replace licensed clinical judgment.
