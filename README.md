# Scolify — AI-Powered Student Opportunity Intelligence Platform

> **"Find Your Next Opportunity"**

Scolify is an AI-powered student opportunity intelligence platform. Unlike traditional scholarship listings, Scolify discovers, verifies, matches, and assists students through the complete opportunity lifecycle with guaranteed human approval prior to any external application submission.

---

## 🏗 Master Architecture

```
                    SCOLIFY
                       |
                 React Frontend
                       |
              UI / State / Routing
                       |
                Express API
                       |
              Service Layer
                       |
             Agent Orchestrator
                       |
        +--------------+--------------+
        |              |              |
     AI Layer       Rule Engine   Opportunity
        |              |           Services
       Groq       Deterministic       |
                       |              |
                       +------+-------+
                              |
                           Supabase
                +-------------+-------------+
                |             |             |
             PostgreSQL      Auth         Storage
                |
               RLS
```

---

## 🛠 Technology Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Router v7
- **Backend:** Node.js, Express.js, TypeScript, tsx, CORS, Rate Limiting, Helmet
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth, Supabase Storage, RLS Policies
- **AI Infrastructure:** Groq API (Llama-3.3-70B model orchestration), Deterministic Rule Engine

---

## 📂 Project Structure

```
SCOLIFY/
├── src/                          # Frontend React Application
│   ├── app/                      # Main App Entry & Providers
│   ├── assets/                   # Static Media & Icons
│   ├── components/               # Reusable UI Primitives & Common Cards
│   │   ├── ui/                   # Button, Input, Badge, Progress, Card, etc.
│   │   └── common/               # OpportunityCard, AIInsightCard, etc.
│   ├── config/                   # Env Config & API Endpoint Mappings
│   ├── features/                 # Modular Business Feature Boundaries
│   ├── hooks/                    # Custom Hooks
│   ├── layouts/                  # MainLayout, DashboardLayout, Navbar, Sidebar
│   ├── lib/                      # Supabase Client & apiClient Wrapper
│   ├── pages/                    # Public & Authenticated App Pages
│   ├── routes/                   # AppRoutes & Route Protection Guards
│   ├── services/                 # Frontend Service Contracts
│   ├── store/                    # Auth & UI State Stores
│   ├── styles/                   # Design Tokens & Globals CSS
│   ├── types/                    # TypeScript Data Contracts
│   └── utils/                    # Formatters, Validators, Tailwind Merger
├── server/                       # Express API & AI Orchestrator Backend
│   ├── src/
│   │   ├── config/               # Env & Constants Config
│   │   ├── controllers/          # Request Handlers & Responses
│   │   ├── middleware/           # Rate Limit, Error Handling, Cors
│   │   ├── routes/               # Versioned API Routes (/api/v1/)
│   │   ├── services/             # Backend Business Logic
│   │   ├── agents/               # AI Agent Orchestrator Contracts
│   │   ├── repositories/         # Supabase Data Repositories
│   │   ├── validators/           # Input Validators
│   │   ├── types/                # Express & API Types
│   │   ├── utils/                # Standardized Response Helpers & Logger
│   │   ├── integrations/         # Groq AI & Supabase Admin Clients
│   │   ├── app.ts                # Express App Setup
│   │   └── server.ts             # Node HTTP Server Entrypoint
│   ├── package.json
│   └── tsconfig.json
├── supabase/
│   └── migrations/               # DDL SQL Migration Schemas & RLS Policies
├── .env.example                  # Environment Variables Schema Blueprint
├── .gitignore                    # Git Exclusion Rules
├── package.json                  # Root Monorepo Scripts
├── vite.config.ts                # Vite Frontend Bundler Config
└── README.md                     # Project Documentation
```

---

## 🚀 Setup & Execution

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
# Install root frontend dependencies
npm install

# Install backend server dependencies
cd server && npm install && cd ..
```

### 3. Run Development Servers

```bash
# Run both Frontend (Port 3000) and Backend (Port 5000) concurrently:
npm run dev

# Or run separately:
npm run dev:client  # Launches Vite Dev Server
npm run dev:server  # Launches Express API Server
```

---

## 🧪 Validation & Type Verification

```bash
# Type check both client and server:
npm run type-check

# Test build compilation:
npm run build
```

---

## 📌 Architectural Guarantees & Safety Policy

1. **Human Approval Guarantee:** AI agents assist in discovery, eligibility analysis, document gap identification, and draft preparation. Applications are **NEVER** automatically submitted without explicit user approval.
2. **Fact Accuracy Policy:** Scolify never invents student facts, achievements, academic records, scholarship details, or company legitimacy.
3. **Decoupled Architecture:** Groq API keys and Supabase Service Role credentials are kept strictly on the Express backend server and never exposed to the frontend browser.
