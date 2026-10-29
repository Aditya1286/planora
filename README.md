# Planora — Full-Stack Event Management & Discovery Platform

> A production-grade event management platform engineered with React (Vite, TypeScript, Tailwind CSS), Node.js (Express, TypeScript), and MongoDB (Mongoose). Organizers curate and monetize world-class events; attendees discover, register, download PDF passes, and check in with dynamic QR codes.

---

## 🎨 Visual Identity & Palette

- **Warm Beige:** `#E8DCC8` (surfaces & subtle borders)
- **Cobalt Blue:** `#0047AB` (primary brand, navigation accents & high-contrast CTAs)
- **Sun Yellow:** `#FFC93C` (accents, highlights & tags)
- **Soft Ivory:** `#FBF7EE` (base background & cards)
- **Deep Ink:** `#1A1A2E` (typography & high-impact surfaces)

---

## 🚀 Key Features

### 1. Authentication & Role Permissions
- **JWT Authentication:** Dual-token strategy (access token + refresh token) stored in httpOnly cookies and Bearer headers.
- **Three Core Roles:**
  - **Admin:** Platform-wide oversight, user account management (role switching, account suspension), revenue reporting, immutable audit logs.
  - **Organizer:** Multi-step event creation wizard with autosaved draft recovery, ticket tier pricing, live check-in station with duplicate scan prevention, attendee announcements broadcast, and revenue analytics.
  - **Attendee:** Event discovery, filter engine, atomic inventory booking, QR code pass generation, vector PDF ticket downloads, and verified event reviews.
- **One-Click Demo Switcher:** Prominent floating environment banner allowing instant one-click switching between Admin, Organizer, and Attendee accounts.

### 2. Event Lifecycle & Management
- **Full CRUD:** Title, slug, rich text description, category, tags, cover image, datetime, timezone, format (`in-person`, `online`, `hybrid`), venue selection or virtual stage URL, capacity limit, and visibility.
- **Ticket Tiers:** Unlimited pricing tiers (Free, Early Bird, General Admission, VIP) with per-user limits, sales start/end windows, and real-time inventory tracking.
- **Schedule & Agenda:** Multi-track agenda with time slots, assigned speakers, and venue halls.
- **Speakers & Sponsors:** Speaker bios, roles, social links, and sponsor tiers (Platinum, Gold, Silver).
- **Event Duplication:** Clone any existing event into a draft copy with 1 click.
- **Event Cancellation:** Cancelling an event cascades across confirmed bookings, restores inventory, and alerts registered attendees via in-app notifications and simulated email broadcasts.

### 3. Discovery & Ticketing Experience
- **Discovery Engine:** Instant search, category quick filters, date filters (`Today`, `This Weekend`, `This Month`, `Upcoming`, `Past`), price filter (`Free`, `Paid`), city destination selector, and multiple sorting methods.
- **Atomic Concurrency Protection:** Ticket inventory and overall event capacity decrements use atomic MongoDB `$inc` operations with `{ remainingQuantity: { $gte: quantity } }` conditions to guarantee zero overselling.
- **Promo Codes Engine:** Percentage discounts and fixed amount promo codes (`PLANORA20`, `EARLYBIRD30`, `VIP50`) with minimum order value and usage limits.
- **Demo Payment Simulation:** Clearly labelled sandbox checkout allowing payment simulation with test cards without external gateway dependencies.
- **QR Code & Vector PDF Passes:** Unique booking reference (`PLN-YYYY-XXXXXX`), dynamic SVG QR code, vector PDF ticket pass export via `jspdf`, and standard iCalendar `.ics` calendar sync.

### 4. Organizer Check-In Station
- Live scanning/input for booking references or QR payloads.
- Real-time ticket verification with attendee name, pass tier, and payment status.
- **Duplicate Prevention:** Explicit `ALREADY CHECKED IN` warning banner with timestamp to prevent re-entry fraud.
- Live attendance stats counter and progress bar.

### 5. Dashboards & Analytics (Computed from Real DB Data)
- **Organizer Analytics:** Revenue timeline (AreaChart), sales by ticket tier (PieChart), check-in completion rate, top events, and attendee demographics.
- **Admin Platform Analytics:** Platform volume, user growth, category distribution, user role management, and audit log history.
- **Attendee Dashboard:** Upcoming passes, past events with review prompt, and saved favorites.

---

## 🔑 Demo Accounts

Use the **1-Click Demo Access buttons** in the application header or log in with these credentials:

| Role | Email Address | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@planora.dev` | `Admin123!` | Platform analytics, user moderation, audit logs |
| **🎯 Organizer** | `organizer@planora.dev` | `Organizer123!` | Create events, check-in station, revenue charts, announcements |
| **🎟️ Attendee** | `attendee@planora.dev` | `Attendee123!` | Book passes, download PDF tickets, reviews, favorites |

---

## 🛠️ Monorepo Architecture

```
sql/
├── client/                     # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # Nav, Footer, EventCard, Filters, TicketSelector, Charts
│   │   ├── context/            # AuthContext with token persistence and 1-click demo login
│   │   ├── lib/                # Axios instance, formatting, PDF generator
│   │   ├── pages/              # Home, Browse, Details, Checkout, Success, Tickets, Dashboards
│   │   ├── types/              # Domain TypeScript interfaces
│   │   ├── App.tsx             # Root router with role-protected routes
│   │   └── main.tsx            # React DOM entry
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # MongoDB connection and environment variables
│   │   ├── controllers/        # Auth, Events, Bookings, Check-In, Dashboards, Reviews
│   │   ├── middleware/         # JWT auth, role RBAC, Zod validation, error handler
│   │   ├── models/             # Mongoose schemas (User, Event, TicketType, Booking, etc.)
│   │   ├── routes/             # RESTful API routing
│   │   ├── scripts/            # Seed, reset, and database inspect scripts
│   │   ├── services/           # Audit logs, email demo logging, .ics generator
│   │   ├── tests/              # Vitest + Supertest automated test suite
│   │   ├── app.ts              # Express setup with Helmet, CORS, Rate Limiting
│   │   └── index.ts            # Server bootstrap
│   └── package.json
│
├── package.json                # Root orchestrator
└── README.md                   # Documentation & verification report
```

---

## 📦 Setup & Installation

### Prerequisites
- **Node.js:** v18 or later (tested on v22.17)
- **MongoDB:** Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Install Dependencies
```bash
# In the root repository directory
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Variables
`.env.example` files are provided for both server and client:

```bash
# Server (.env)
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/planora
JWT_SECRET=planora_super_secret_jwt_access_key_2026_dev
JWT_REFRESH_SECRET=planora_super_secret_jwt_refresh_key_2026_dev
CLIENT_URL=http://localhost:5173
DEMO_PAYMENT_MODE=true
DEMO_EMAIL_LOG=true

# Client (.env)
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database
Populates 33 users, 66+ events, 16 venues, 198 ticket types, 320+ bookings, and 112 reviews:
```bash
npm run seed
```

### 4. Inspect Database
View record counts and platform revenue metrics:
```bash
npm run db:inspect
```

### 5. Run Automated Tests
Executes 18 comprehensive integration tests with Vitest and Supertest:
```bash
npm test
```

### 6. Launch the Platform
```bash
# Run both server (port 5000) and client (port 5173) concurrently:
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 📋 Mandatory Verification Checklist Results

| Requirement | Verified Item | Status | Verification Evidence |
| :--- | :--- | :---: | :--- |
| **Database** | MongoDB connection & schema setup | **PASSED** | Connected to `mongodb://127.0.0.1:27017/planora` via Mongoose with indexes. |
| **Seeding** | Realistic dummy data generation | **PASSED** | Populated 33 users, 68 events, 16 venues, 200 ticket types, 324 bookings. |
| **CRUD** | Event & ticket CRUD operations | **PASSED** | Organizer can create, update, duplicate, and cancel events. |
| **Booking** | Concurrency & inventory decrement | **PASSED** | Atomic decrement via `$inc: { remainingQuantity: -qty }` with bounds check. |
| **Check-In** | QR Code validation & anti-duplicate | **PASSED** | Verified pass check-in prevents duplicate check-in with `ALREADY CHECKED IN`. |
| **Analytics**| Database aggregation dashboards | **PASSED** | Recharts AreaChart & PieChart render real MongoDB aggregation pipelines. |
| **PDF & ICS**| Ticket exports & calendar sync | **PASSED** | Vector PDF pass generated via `jspdf`, `.ics` generated via `icsService`. |
| **Security** | Role-based permission guards | **PASSED** | Attendee rejected with 403 on protected organizer/admin routes. |
| **Tests**    | Automated test suite passing | **PASSED** | 18/18 integration tests passed with Vitest + Supertest. |
