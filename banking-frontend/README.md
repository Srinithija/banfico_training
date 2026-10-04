# Banking Frontend

A React single-page application for the Banfico banking system. Provides role-aware UI for Makers and Checkers to manage customers, accounts, transactions, beneficiaries, and consents.

Developed as part of the **Banfico University Full-Stack Developer Training Program**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Auth | Keycloak JS (keycloak-js 26) |
| Styling | Tailwind CSS v4 |
| Containerization | Docker + Nginx |

---

## Prerequisites

- Node.js 18+
- npm 9+
- A running Keycloak instance with `banking-realm` and a `banking-frontend` client configured
- The Spring Boot backend running and reachable

---

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example` if present):

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=banking-realm
VITE_KEYCLOAK_CLIENT_ID=banking-frontend
```

When running via Docker Compose with Nginx, these point to internal Nginx routes and are baked in at build time.

---

## Running Locally

```bash
npm install
npm run dev
```

The app starts on **http://localhost:5173** by default.

---

## Running with Docker Compose (recommended)

From the workspace root:

```bash
docker-compose up --build
```

Nginx proxies `http://localhost:8080` — the frontend is served at `/` and the API at `/api`.

---

## Project Structure

```
src/
├── auth/
│   ├── keycloak.js        # Keycloak JS instance (singleton)
│   └── roles.js           # hasRole(role) helper — reads realm_access.roles from JWT
├── components/
│   └── Navbar.jsx         # Top navigation bar with role-aware links
├── pages/
│   ├── Dashboard.jsx
│   ├── accounts/
│   │   ├── AccountList.jsx
│   │   ├── AccountDetails.jsx
│   │   ├── CreateAccount.jsx
│   │   ├── CreateTransaction.jsx
│   │   └── TransactionHistory.jsx
│   ├── beneficiaries/
│   │   ├── BeneficiaryList.jsx   # Status badges + Checker approve/reject buttons
│   │   └── CreateBeneficiary.jsx # Success screen shows Status: PENDING
│   ├── consents/
│   │   ├── ConsentList.jsx
│   │   └── CreateConsent.jsx
│   └── customers/
│       ├── CustomerList.jsx
│       └── CreateCustomer.jsx
├── services/
│   └── api.js             # Axios instance — auto-attaches Bearer JWT, refreshes token
├── App.jsx                # Router and layout
└── main.jsx               # Keycloak init → mounts React app after auth
```

---

## Authentication Flow

1. `main.jsx` calls `keycloak.init({ onLoad: 'login-required' })` — the user is redirected to Keycloak if not authenticated.
2. On return, the Keycloak token is available as `keycloak.token`.
3. The Axios interceptor in `api.js` calls `keycloak.updateToken(30)` before every request to silently refresh the token if it expires within 30 seconds, then attaches `Authorization: Bearer <token>`.
4. `hasRole(role)` reads `keycloak.tokenParsed.realm_access.roles` to drive conditional rendering.

---

## Role-Based UI

| Feature | MAKER | CHECKER | ADMIN |
|---|---|---|---|
| Add Beneficiary button | Visible | Hidden | Hidden |
| Approve / Reject buttons | Hidden | Visible (PENDING only) | Hidden |
| Add Transaction button | Visible | Hidden | Hidden |
| Transaction approve/reject | Hidden | Visible (PENDING only) | Hidden |
| Create Account button | Hidden | Hidden | Visible |
| Delete Beneficiary button | Hidden | Visible | Visible |

> UI hiding is a UX convenience only. All role enforcement is done server-side by Spring Security — calling a restricted endpoint with the wrong role returns `403 Forbidden`.

---

## Maker-Checker UI Workflow

### MAKER creates a beneficiary

1. Navigates to `/beneficiaries/create`.
2. Fills in the form and submits.
3. On success, instead of navigating away, a success screen is shown:
   - Green checkmark
   - "Beneficiary created successfully"
   - Yellow **Status: PENDING** badge
   - Summary of the created record (ID, name, account, bank, IFSC)
   - Buttons: "View All Beneficiaries" or "Add Another Beneficiary"

### CHECKER reviews beneficiaries

1. Navigates to `/beneficiaries`.
2. The Status column shows color-coded badges: yellow = PENDING, green = APPROVED, red = REJECTED.
3. For each PENDING row, two buttons appear: **Approve** (green) and **Reject** (red).
4. Clicking either calls the backend and refreshes the list automatically.
5. APPROVED and REJECTED rows show no action buttons.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
