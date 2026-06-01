# ChildGuard Ghana

**A full-stack child protection reporting platform for Ghana.**  
Built for community members, field officers, and district administrators to report, track, and resolve child labour, trafficking, and abuse cases — online, offline, and via feature-phone USSD menus.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Repository Structure](#repository-structure)
4. [Features](#features)
   - [Mobile App](#mobile-app-childguardghana)
   - [API Service](#api-service)
   - [SMS / USSD Service](#sms--ussd-service)
5. [Tech Stack](#tech-stack)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [1 — API Service](#1--api-service-setup)
   - [2 — SMS Service](#2--sms-service-setup)
   - [3 — Mobile App](#3--mobile-app-setup)
7. [Environment Variables](#environment-variables)
8. [API Reference](#api-reference)
9. [Data Models](#data-models)
10. [Risk Scoring Algorithm](#risk-scoring-algorithm)
11. [User Roles & Permissions](#user-roles--permissions)
12. [Offline Support](#offline-support)
13. [Multi-Language Support](#multi-language-support)
14. [USSD Flow](#ussd-flow)
15. [Push Notifications](#push-notifications)
16. [Deployment](#deployment)
17. [Roadmap & Future Features](#roadmap--future-features)
18. [Contributing](#contributing)
19. [License](#license)

---

## Overview

ChildGuard Ghana is a mobile-first child protection system designed specifically for Ghana's social protection landscape. It enables:

- **Community members and teachers** to report suspected child labour, trafficking, or abuse — anonymously or with an account — in under 3 minutes.
- **Social workers, police DOVVSU officers, and NGO agents** to receive, triage, investigate, and resolve cases from a mobile dashboard.
- **District administrators** to monitor caseloads, track officer performance, and generate shareable district reports.
- **Feature-phone users** to submit reports via a structured USSD menu (no smartphone required).

The system is designed for the realities of Ghanaian field work: intermittent connectivity, multiple languages, and the need for strict child-safety privacy controls.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ChildGuard Ghana                         │
│                                                             │
│  ┌──────────────────────┐    ┌────────────────────────┐    │
│  │  Mobile App          │    │  Feature Phone          │    │
│  │  (Expo / React       │    │  (USSD *384#)           │    │
│  │   Native)            │    │                         │    │
│  └──────────┬───────────┘    └───────────┬─────────────┘    │
│             │ HTTPS REST                 │ USSD Protocol     │
│             ▼                            ▼                   │
│  ┌──────────────────────┐    ┌────────────────────────┐    │
│  │  api-service         │    │  sms-service            │    │
│  │  Node.js + Express   │    │  Node.js + Express      │    │
│  │  Port 4000           │◄──►│  Port 3100              │    │
│  │                      │    │  (Arkesel SMS/USSD)     │    │
│  └──────────┬───────────┘    └────────────────────────┘    │
│             │ Prisma ORM                                     │
│             ▼                                               │
│  ┌──────────────────────┐    ┌────────────────────────┐    │
│  │  PostgreSQL           │    │  Cloudinary            │    │
│  │  (Cases, Users,       │    │  (Evidence Photos)     │    │
│  │   Officers,           │    │                        │    │
│  │   Timelines)          │    └────────────────────────┘    │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
CG/
├── ChildGuardGhana/          # Expo / React Native mobile app
│   ├── app/                  # Expo Router file-based routes
│   │   ├── (admin)/          # Admin-only screens
│   │   ├── (officer)/        # Officer-only screens
│   │   ├── (reporter)/       # Reporter screens
│   │   └── (modals)/         # Modal overlays (emergency SOS)
│   ├── src/
│   │   ├── components/       # Reusable UI components (GlassCard, CaseCard, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── i18n/             # Translations: English, Twi, Ga
│   │   ├── mock/             # Static reference data (Ghana geography, education)
│   │   ├── services/         # API client, risk scoring, notifications
│   │   ├── store/            # Zustand state stores
│   │   ├── theme/            # Design system (colors, typography, glassmorphism)
│   │   ├── types/            # TypeScript interfaces and enums
│   │   └── utils/            # Formatters, color utils, location utils
│   ├── assets/               # App icons, splash screen, fonts
│   ├── .env                  # EXPO_PUBLIC_API_URL
│   └── app.json              # Expo configuration
│
├── api-service/              # Core REST API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── config/           # Env validation (Zod)
│   │   ├── middleware/        # JWT auth, file upload (multer)
│   │   ├── routes/           # Express route handlers
│   │   ├── services/         # Business logic layer
│   │   └── utils/            # Logger, risk scoring, case ID generation
│   ├── .env                  # Secrets (not committed)
│   └── .env.example          # Template
│
└── sms-service/              # SMS & USSD microservice
    ├── src/
    │   ├── routes/           # SMS send, webhook receipt
    │   ├── services/         # Arkesel client, template renderer
    │   ├── ussd/             # USSD session store + menu flow engine
    │   └── utils/            # Logger, phone formatter
    ├── .env
    └── .env.example
```

---

## Features

### Mobile App (`ChildGuardGhana/`)

#### Reporting (Reporter Role)
- **5-step guided report form**: Case type → Child information → Location → Incident details → Review & submit
- **12 case types** covering child labour (agriculture, fishing, mining, domestic, manufacturing, street), trafficking (labour, sexual, domestic), neglect, early marriage, and physical abuse
- **Emergency triage** — three danger flags automatically escalate priority: child still with perpetrator, recent violence, and no basic needs being met
- **GPS location detection** with interactive map picker and manual district/region selection from all 16 Ghana regions
- **Evidence photo capture** — up to 4 images per report, uploaded to Cloudinary
- **Anonymous mode** — reporters can submit with zero identity stored; anonymous JWT session is created on device
- **Offline queue** — reports drafted without connectivity are saved locally and automatically synced when the device reconnects
- **Case tracking** — track any case by its unique case number (e.g. `CG-2026-00001`) or view your own report history

#### Emergency SOS
- **Hold-to-activate** gesture prevents accidental triggers
- Dispatches automatically to the nearest available officer in the same region
- Sends push notifications to all admin accounts
- Creates a high-priority case record with full audit trail
- Officer name confirmed in-app within seconds of dispatch

#### Education (Learn Tab)
- Four module categories: Child Labour, Trafficking, How to Report, Safety Tips
- Each module includes definition, warning signs, legal context (Ghana law), and recommended actions
- **Interactive quiz** with multiple-choice questions and explanations
- Progress tracked with completion badges

#### Officer Dashboard
- Filterable case list: All / Active / Pending / Critical / Resolved
- Animated critical-case pulse indicator
- Per-case detail view with full status timeline
- Status update with officer notes (triggers SMS + push notification to reporter)
- Offline-aware with sync banner

#### Admin Panel
- Real-time stat cards: total cases, open cases, resolved this month, critical
- Animated monthly trend bar chart (6-month rolling)
- Case type distribution breakdown with percentage bars
- Officer performance table with caseload meters
- Assign-cases modal with officer chip selector
- Shareable district report (text format, native share sheet)

#### Privacy & Safety
- **Disguise mode** — one tap switches the app to a calculator-style interface so it cannot be identified as a reporting tool by an abuser
- Anonymous reporter sessions leave no personally identifiable information in the database
- All JWT tokens stored in device secure enclave (Expo SecureStore)
- Rate limiting on all API endpoints

#### Internationalisation
- UI available in **English**, **Twi**, and **Ga**
- Language preference persisted across sessions
- i18next with `react-i18next`, full translation files in `src/i18n/`

---

### API Service

The central REST API consumed by the mobile app.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Phone + password login |
| `POST` | `/api/auth/anonymous` | Create an anonymous reporter session |
| `POST` | `/api/auth/push-token` | Save Expo push token for notifications |
| `POST` | `/api/cases` | Submit a new case report |
| `GET` | `/api/cases` | List cases (scoped by role) |
| `GET` | `/api/cases/:id` | Get case with full timeline |
| `PATCH` | `/api/cases/:id/status` | Update case status (officer / admin) |
| `PATCH` | `/api/cases/:id/assign` | Assign officer to case (admin) |
| `GET` | `/api/officers` | List officers |
| `GET` | `/api/officers/:id` | Get officer + active cases |
| `POST` | `/api/officers` | Create officer profile (admin) |
| `PATCH` | `/api/officers/:id` | Update officer (admin) |
| `POST` | `/api/emergency/sos` | Trigger SOS — auto-dispatch + notify |
| `GET` | `/api/stats/dashboard` | Aggregate dashboard statistics |
| `GET` | `/api/stats/heatmap` | District-level heatmap data |
| `POST` | `/api/upload/photo` | Upload evidence image to Cloudinary |
| `GET` | `/health` | Health check |

---

### SMS / USSD Service

A standalone microservice that handles Arkesel SMS/USSD integration so the core API stays clean.

**SMS Notifications:**
- Case status update SMS to reporters (when not anonymous)
- Officer assignment notification SMS
- Emergency broadcast to all officers in a region
- Formatted templates with case number, status, and action link

**USSD Menu (feature phones, `*384#`):**
```
WELCOME TO CHILDGUARD
1. Report a case
2. Track a case
3. Emergency

[Report flow]
1. Type → 2. Child age → 3. Child gender
→ 4. Your district → 5. Description
→ 6. Anonymous? → Submit → Case ID returned
```

The USSD session engine maintains in-memory state per phone number with a configurable timeout.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo ~54.0.0 · React Native 0.81.5 · React 19.1.0 |
| Routing | Expo Router 6 (file-based) |
| State | Zustand 4.5.0 |
| Forms | React Hook Form · Zod |
| Animation | Moti · React Native Reanimated 4 · Lottie |
| UI Icons | Lucide React Native |
| Fonts | Plus Jakarta Sans · Inter (Google Fonts) |
| i18n | i18next · react-i18next |
| Token storage | Expo SecureStore |
| Push notifications | Expo Notifications (client) · expo-server-sdk (server) |
| API runtime | Node.js · TypeScript 5.4 · Express 4 |
| Database | PostgreSQL 18 · Prisma ORM 5.22 |
| Auth | JSON Web Tokens · bcryptjs |
| File storage | Cloudinary SDK v2 |
| SMS / USSD | Arkesel API v2 (Ghana) |
| Validation | Zod (shared on client + server) |
| Logging | Winston |
| Package manager | pnpm (all three workspaces) |
| Language | TypeScript throughout |

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **pnpm** 8+
- **PostgreSQL** 15+ (local or cloud — Supabase, Neon, Railway all work)
- **Expo CLI** — `npm install -g expo-cli`
- **Cloudinary** account (free tier is sufficient for development)
- A physical Android/iOS device or simulator
- (Optional) Arkesel account for SMS in development

---

### 1 — API Service Setup

```bash
cd api-service

# Install dependencies
pnpm install

# Copy env template and fill in values
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/childguard"
JWT_SECRET=your-long-random-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
INTERNAL_API_KEY=childguard-internal-key
EXPO_ACCESS_TOKEN=           # optional — from expo.dev
```

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE childguard;"

# Push schema to the database
pnpm db:push

# Start the dev server (hot reload)
pnpm dev
```

The API is now running at `http://localhost:4000`. Verify with:
```bash
curl http://localhost:4000/health
# {"status":"ok","service":"childguard-api","env":"development"}
```

Create your first admin account:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"System Admin","phone":"0240000001","password":"Admin@123","role":"admin"}'
```

---

### 2 — SMS Service Setup

```bash
cd sms-service

pnpm install
cp .env.example .env   # fill in ARKESEL_API_KEY and WEBHOOK_SECRET
pnpm dev
```

The SMS service runs on port **3100** and registers its own USSD + webhook routes. For local development you can skip Arkesel credentials — just keep the service running without real SMS sending.

---

### 3 — Mobile App Setup

```bash
cd ChildGuardGhana

pnpm install

# Create env file
echo "EXPO_PUBLIC_API_URL=http://localhost:4000/api" > .env
```

> **Physical device note:** Replace `localhost` with your machine's local IP address (e.g. `192.168.1.5`) so the phone can reach the API over your WiFi network.

```bash
# Start Expo development server
pnpm start

# Or run directly on a platform
pnpm android
pnpm ios
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS) to open the app.

---

## Environment Variables

### `api-service/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` \| `production` |
| `PORT` | No | API port (default: `4000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | HS256 signing secret (min 16 chars) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `INTERNAL_API_KEY` | Yes | Shared secret with sms-service |
| `EXPO_ACCESS_TOKEN` | No | For sending push notifications |

### `sms-service/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | SMS service port (default: `3100`) |
| `ARKESEL_API_KEY` | Yes | Arkesel API v2 key |
| `ARKESEL_SENDER_NAME` | No | SMS sender label (default: `ChildGuard`) |
| `ARKESEL_SANDBOX` | No | Set `true` to disable real SMS sending |
| `WEBHOOK_SECRET` | Yes | Validates Arkesel delivery receipts |
| `INTERNAL_API_KEY` | Yes | Must match `api-service` value |
| `EMERGENCY_FALLBACK_PHONE` | No | DOVVSU national line (default: `+233302684000`) |

### `ChildGuardGhana/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Full base URL of the API service |

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <JWT>
```

### Authentication

#### `POST /api/auth/register`
```json
// Request
{ "name": "Kwame Asante", "phone": "0241234567", "password": "SecurePass@1", "role": "reporter" }

// Response 201
{ "token": "eyJ...", "user": { "id": "...", "name": "Kwame Asante", "role": "reporter" } }
```

#### `POST /api/auth/login`
```json
// Request
{ "phone": "0241234567", "password": "SecurePass@1" }

// Response 200
{ "token": "eyJ...", "user": { "id": "...", "name": "Kwame Asante", "role": "reporter", "officerId": null } }
```

#### `POST /api/auth/anonymous`
Creates a temporary anonymous reporter session. No body required.

### Cases

#### `POST /api/cases`
```json
{
  "type": "child_labour_fishing",
  "childAge": 9,
  "childGender": "male",
  "location": { "district": "Keta", "region": "Volta", "lat": 5.9135, "lng": 0.9915 },
  "description": "Child observed operating fishing nets without adult supervision on Lake Volta.",
  "photos": ["https://res.cloudinary.com/..."],
  "isAnonymous": false,
  "isEmergency": false,
  "dangerTriage": { "withPerp": false, "recentViolence": false, "noBasicNeeds": true }
}
```

Response includes a generated `caseNumber`, computed `riskScore` (0–100), and `priority` (low/medium/high/critical).

#### `PATCH /api/cases/:id/status`
```json
{ "status": "investigating", "note": "Visited the fishing site. Child confirmed present." }
```

#### `PATCH /api/cases/:id/assign` *(admin only)*
```json
{ "officerId": "clf9x..." }
```

### Emergency SOS

#### `POST /api/emergency/sos`
```json
{
  "location": { "district": "Ho", "region": "Volta", "lat": 6.6005, "lng": 0.4706 }
}
```
Returns the created case and the automatically assigned officer.

---

## Data Models

### Case
```
id             cuid — internal
caseNumber     CG-YYYY-NNNNN — human-readable reference
type           One of 12 CaseType values
childAge       0–17
childGender    male | female | unknown
district       Ghana district name
region         Ghana region name
lat / lng      GPS coordinates
description    Incident description text
photos         Array of Cloudinary URLs
isAnonymous    Whether reporter identity is hidden
isEmergency    SOS flag
status         submitted → assigned → investigating → intervention → resolved
priority       low | medium | high | critical
riskScore      0–100 computed at submission
timeline       Array of TimelineEvents (audit trail)
```

### Officer
```
id             cuid
badge          Unique badge/ID number
name           Full name
role           social_worker | police_dovvsu | labour_inspector | ngo_agent
district       Assigned district
region         Assigned region
languages      Array (e.g. ["English", "Twi"])
caseload       Current active case count
resolvedThisMonth  Rolling monthly counter
```

### TimelineEvent
Every status change creates an immutable timeline entry recording the status, timestamp, note, and officer name.

---

## Risk Scoring Algorithm

At the moment of case submission the API computes a **risk score (0–100)** which drives automatic priority assignment.

| Factor | Points |
|--------|--------|
| Trafficking (sexual/labour/domestic) | +40 |
| Physical abuse | +25 |
| Mining / fishing child labour | +25 |
| Other child labour / neglect | +10 |
| Child age < 6 | +30 |
| Child age 6–11 | +20 |
| Child age 12–14 | +10 |
| Child still with perpetrator | +15 |
| Recent violence | +15 |
| No basic needs met | +10 |
| Emergency flag | +10 |
| **Maximum** | **100** |

| Score | Priority |
|-------|----------|
| 0–24 | Low |
| 25–49 | Medium |
| 50–74 | High |
| 75–100 | Critical |

Critical cases trigger immediate push notifications to all admin accounts.

---

## User Roles & Permissions

| Action | Reporter | Officer | Admin |
|--------|----------|---------|-------|
| Submit report | ✅ | ✅ | ✅ |
| Submit anonymously | ✅ | ✅ | ✅ |
| View own cases | ✅ | — | — |
| View all cases | — | ✅ | ✅ |
| Update case status | — | ✅ | ✅ |
| Assign officers | — | — | ✅ |
| Trigger SOS | ✅ | ✅ | ✅ |
| View dashboard stats | — | ✅ | ✅ |
| Create officer profiles | — | — | ✅ |
| Generate district reports | — | — | ✅ |

---

## Offline Support

ChildGuard Ghana is designed for low-connectivity environments. The `offlineStore` manages a local queue of pending operations:

1. **Detection** — `@react-native-community/netinfo` monitors network state in real time.
2. **Queueing** — When offline, `submit_report` and `update_status` operations are serialised into the queue and persisted to AsyncStorage.
3. **Sync** — When the device reconnects, `useNetworkSync` hook triggers the queue processor, replaying operations in order against the API.
4. **UI** — An `OfflineBanner` component is shown on all officer/reporter screens when connectivity is lost.

---

## Multi-Language Support

The app ships with full translations for:

| Code | Language | Spoken by |
|------|----------|-----------|
| `en` | English | Official language, urban/educated users |
| `tw` | Twi (Akan) | ~9 million speakers, Ashanti / Greater Accra |
| `ga` | Ga | ~900,000 speakers, Greater Accra |

Language is selected during onboarding and can be changed at any time from the profile screen. The selection persists across sessions via Zustand + AsyncStorage. i18next handles all string interpolation with support for plurals and variable injection.

---

## USSD Flow

For users without smartphones, ChildGuard Ghana provides a USSD menu accessible by dialling `*384#` from any Ghanaian mobile network.

```
*384# → WELCOME TO CHILDGUARD
         1. Report a case
         2. Track a case
         3. Emergency alert

[1 — Report flow]
Step 1:  Case type (child labour / trafficking / neglect / early marriage)
Step 2:  Child labour sub-type (if applicable)
Step 3:  Child age (numeric input)
Step 4:  Child gender (1=Male, 2=Female, 3=Unknown)
Step 5:  Your district (free text)
Step 6:  Brief description (free text, max 160 chars)
Step 7:  Stay anonymous? (1=Yes, 2=No)
Confirm: Submit → returns Case ID

[2 — Track flow]
Enter your Case ID → returns current status and last update

[3 — Emergency]
Confirm → broadcasts SMS alert to all officers in the region
```

Sessions are held in memory per phone number and expire after 5 minutes of inactivity. Arkesel delivers the USSD responses within the 20-second network window.

---

## Push Notifications

Push notifications are delivered via the **Expo Push Notification** infrastructure.

| Trigger | Recipients |
|---------|-----------|
| Case submitted | Assigned officer + all admins |
| Case status updated | Reporter (if not anonymous) |
| Officer assigned to case | Assigned officer |
| Emergency SOS | Assigned officer + all admins |
| Critical priority case | All admin accounts |

The `api-service` stores each user's `expoPushToken` (registered via `POST /api/auth/push-token` on app startup). The `pushService` batches and sends messages via expo-server-sdk, respecting Expo's chunk limits and logging delivery errors.

---

## Deployment

### API Service (e.g. Railway, Render, Fly.io)

```bash
# Build TypeScript
pnpm build

# Start production server
pnpm start
```

Set all production environment variables in your hosting dashboard. The `DATABASE_URL` should point to a managed PostgreSQL instance (Supabase, Neon, or Railway PostgreSQL).

For the database schema on first deploy:
```bash
pnpm db:push   # or pnpm db:migrate for migration-based flow
```

### SMS Service

Deploy alongside the API on the same host or as a separate service. Ensure:
- `INTERNAL_API_KEY` matches the API service value
- Arkesel webhook URL is configured to point at `https://your-sms-service.com/api/webhook/delivery`

### Mobile App (Expo EAS Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Production build for Android
eas build --platform android --profile production

# Production build for iOS
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

Bundle identifiers:
- Android: `com.blackbusinesslabs.childguardghana`
- iOS: `com.blackbusinesslabs.childguardghana`

---

## Roadmap & Future Features

### Near-term (v1.1 — v1.2)

- **Real-time case updates via WebSockets** — officers and admins see status changes instantly without pulling; Socket.io or Expo's long-polling
- **GIS heatmaps with PostGIS** — replace the current coordinate bucketing with proper spatial queries and render a full interactive map in the admin panel using `react-native-maps`
- **Case evidence chain of custody** — cryptographic hash stored for each uploaded photo at the time of upload to support legal proceedings
- **SMS two-factor authentication** — OTP via Arkesel for officer and admin login to reduce credential sharing risk
- **Offline-first sync with conflict resolution** — use a CRDT-based or last-write-wins strategy to handle cases updated both offline and on the server simultaneously
- **WhatsApp reporting channel** — Twilio or Meta Cloud API integration so reporters can submit via WhatsApp without installing the app

### Medium-term (v1.3 — v2.0)

- **AI-assisted risk scoring** — fine-tune a classification model on historical cases (with ethics review and PII scrubbing) to surface patterns the current rule-based scorer misses
- **Multilingual voice reporting** — integrate Ghana's Twi and Ga speech-to-text (via Google Cloud STT or local Hugging Face model) so users can dictate instead of type
- **Legal case handoff module** — generate a standardised referral document (PDF) linking the case record to the Ghana Social Welfare Department CPIMS system
- **Court appearance and outcome tracking** — follow-up screens for officers to record prosecution outcomes, enabling UNICEF and ILO outcome reporting
- **Biometric authentication** — Face ID / fingerprint login for officers and admins using `expo-local-authentication`
- **Cross-border trafficking alert network** — federated alert system shared between Ghana, Côte d'Ivoire, Togo, and Burkina Faso instances using a shared API key model

### Long-term (v2.0+)

- **Foster care and rehabilitation tracking** — after case resolution, track child placement in foster care, school re-enrollment, and periodic welfare check-ins
- **Community guardian network** — allow verified community leaders (e.g. head teachers, chiefs) to receive digest alerts for their area without accessing full case details
- **NGO partnership portal** — web dashboard for UNICEF, ILO, and Ghana Social Welfare Department to pull anonymised aggregate data and fund response programmes
- **Predictive dispatch** — ML model trained on officer response times, district patterns, and case types to suggest the optimal officer assignment before the admin makes the decision
- **Automated regulatory reporting** — one-click export of monthly NCCP-formatted statistics directly to the Ghana National Child Protection Commission
- **Offline AI triage** — on-device (ONNX or TensorFlow Lite) model that provides a preliminary risk assessment before the report even reaches the server, useful when connectivity is poor and a quick priority flag is needed
- **Encrypted journalist mode** — a high-privacy reporting channel for investigative journalists submitting trafficking intelligence, with Signal-protocol-style end-to-end encryption and automatic key rotation

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a clear message following the format: `type(scope): description`
4. Push your branch and open a Pull Request against `main`
5. Ensure all TypeScript types pass: `pnpm build` in both `api-service` and `sms-service`

Please do not commit `.env` files, `node_modules/`, `dist/`, or any files containing real case data or personally identifiable information.

---

## License

This project is licensed under the **MIT License** — see [LICENSE](./ChildGuardGhana/LICENSE) for details.

Built with care by [Black Business Labs](https://blackbusinesslabs.com) for the children of Ghana.

---

*"Every child deserves to grow up safe, educated, and free."*
