# Banfico Banking Application

A full-stack banking application with role-based access control and a Maker-Checker approval workflow for sensitive operations. Built with Spring Boot, React, Keycloak, PostgreSQL, and Nginx.

Developed as part of the **Banfico University Full-Stack Developer Training Program**.

---

## Architecture

```
Browser
   │
   ▼
Nginx  (port 8080)
   │
   ├──→  /api/**   →  Spring Boot Backend
   └──→  /*        →  React Frontend (static)

Keycloak  (port 8180)  ←── JWT issuer
PostgreSQL (port 5434)  ←── persistence
```

All services run together via Docker Compose.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.x |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL 16 |
| Security | Spring Security OAuth2 Resource Server |
| Identity Provider | Keycloak 26 |
| Validation | Jakarta Bean Validation |
| Build Tool | Maven (wrapper included) |
| Utilities | Lombok |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Auth | keycloak-js 26 |
| Styling | Tailwind CSS v4 |

---

## Roles

| Role | Responsibilities |
|---|---|
| `ADMIN` | Creates and manages customers and accounts |
| `MAKER` | Initiates transactions, beneficiaries, and consents (sets status to PENDING) |
| `CHECKER` | Reviews PENDING requests — approves or rejects them |

Roles are defined as **Keycloak realm roles** and extracted from the `realm_access.roles` claim in the JWT by `KeycloakRoleConverter`.

> Frontend button visibility is a UX convenience. All role enforcement is done server-side by Spring Security — a wrong-role API call always returns `403 Forbidden`.

---

## Maker-Checker Workflow

Sensitive operations require a two-step process. The same person cannot both create and approve a request.

```
MAKER creates request
        │
        ▼
   status: PENDING
        │
   ┌────┴────┐
   ▼         ▼
APPROVE    REJECT
   │         │
   ▼         ▼
APPROVED  REJECTED
```

**Valid state transitions:** `PENDING → APPROVED` and `PENDING → REJECTED` only.
Attempting to approve or reject a non-PENDING record returns `400 Bad Request`.

**Modules with Maker-Checker:**

| Module | MAKER | CHECKER |
|---|---|---|
| Transactions | `POST /api/accounts/{id}/transactions` | `PUT .../approve` \| `.../reject` |
| Beneficiaries | `POST /api/beneficiaries` | `PUT /api/beneficiaries/{id}/approve` \| `.../reject` |
| Consents | `POST /api/consents` | `PUT /api/consents/{id}/approve` \| `.../reject` |

---

## Prerequisites

- Docker Desktop (for the full stack)
- Java 21+ and Maven 3.8+ (for local backend development only)
- Node.js 18+ and npm 9+ (for local frontend development only)

---

## Quick Start — Docker Compose

```bash
git clone <your-repo-url>
cd BANK
docker-compose up --build
```

| Service | URL |
|---|---|
| Application | http://localhost:8080 |
| Keycloak Admin Console | http://localhost:8180 |

Login to Keycloak admin at `http://localhost:8180` with `admin / admin`, then configure the `banking-realm` and assign roles to your users.

---

## Running Locally (without Docker)

### Backend

```bash
cd banking-crud-ap
./mvnw spring-boot:run
```

Make sure PostgreSQL is running on port `5434` and Keycloak is running on port `8180`.
Update `src/main/resources/application.properties` if your credentials differ:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5434/bankdb
spring.datasource.username=postgres
spring.datasource.password=admin123
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/banking-realm
```

Hibernate creates all tables automatically on first run (`ddl-auto=update`).

### Database

```sql
CREATE DATABASE bankdb;
```

### Frontend

```bash
cd banking-frontend
npm install
npm run dev
```

The dev server starts on **http://localhost:5173**.

Create or update `banking-frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=banking-realm
VITE_KEYCLOAK_CLIENT_ID=banking-frontend
```

---

## Project Structure

```
BANK/
├── banking-crud-ap/              # Spring Boot backend
│   └── src/main/java/com/banfico/banking_crud_ap/
│       ├── config/
│       │   ├── KeycloakRoleConverter.java   # Extracts roles from JWT
│       │   ├── SecurityConfig.java          # URL-level role authorization
│       │   └── WebConfig.java               # CORS configuration
│       ├── controller/                      # REST controllers
│       ├── dto/
│       │   ├── request/                     # Validated request DTOs
│       │   └── response/                    # Response DTOs + ErrorResponse
│       ├── entity/                          # JPA entities
│       │   └── BeneficiaryStatus.java       # Enum: PENDING, APPROVED, REJECTED
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│       │   └── ResourceNotFoundException.java
│       ├── repository/                      # Spring Data JPA repositories
│       └── service/
│           ├── impl/                        # Service implementations
│           └── *.java                       # Service interfaces
│
├── banking-frontend/             # React frontend
│   └── src/
│       ├── auth/
│       │   ├── keycloak.js           # Keycloak singleton
│       │   └── roles.js              # hasRole() helper
│       ├── components/
│       │   └── Navbar.jsx            # Role-aware navigation
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── accounts/             # Account + Transaction pages
│       │   ├── beneficiaries/        # BeneficiaryList, CreateBeneficiary
│       │   ├── consents/             # ConsentList, CreateConsent
│       │   └── customers/            # CustomerList, CreateCustomer
│       ├── services/
│       │   └── api.js                # Axios instance with JWT interceptor
│       └── App.jsx                   # Router and layout
│
├── nginx/
│   └── nginx.conf                # Reverse proxy config
├── docker-compose.yml
└── README.md
```

---

## API Reference

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Returns `{ status: "UP" }` |
| GET | `/api/info` | None | Application info |

---

### Customers

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/customers` | Authenticated | Create a customer |
| GET | `/api/customers` | Authenticated | List all customers |
| GET | `/api/customers/{id}` | Authenticated | Get customer by ID |
| PUT | `/api/customers/{id}` | Authenticated | Update customer |
| DELETE | `/api/customers/{id}` | Authenticated | Delete customer |

```json
// POST /api/customers
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "address": "123 Main Street"
}
```

---

### Accounts

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/accounts` | `ADMIN` | Create an account |
| GET | `/api/accounts` | Authenticated | List all accounts |
| GET | `/api/accounts/{id}` | Authenticated | Get account by ID |
| DELETE | `/api/accounts/{id}` | Authenticated | Delete account |

```json
// POST /api/accounts
{
  "accountNumber": "ACC001",
  "accountType": "SAVINGS",
  "balance": 5000.00,
  "customerId": 1
}
```

---

### Transactions — Maker-Checker

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/accounts/{accountId}/transactions` | `MAKER` | Create a PENDING transaction |
| GET | `/api/accounts/{accountId}/transactions` | Authenticated | List transactions for account |
| PUT | `/api/accounts/{accountId}/transactions/{txId}/approve` | `CHECKER` | Approve PENDING transaction |
| PUT | `/api/accounts/{accountId}/transactions/{txId}/reject` | `CHECKER` | Reject PENDING transaction |

```json
// POST /api/accounts/1/transactions
{
  "amount": 1000.00,
  "transactionType": "DEPOSIT"
}
```

---

### Beneficiaries — Maker-Checker

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/beneficiaries` | `MAKER` | Create a PENDING beneficiary |
| GET | `/api/beneficiaries` | Authenticated | List all beneficiaries |
| GET | `/api/beneficiaries/{id}` | Authenticated | Get beneficiary by ID |
| GET | `/api/beneficiaries/customer/{customerId}` | Authenticated | List by customer |
| PUT | `/api/beneficiaries/{id}/approve` | `CHECKER` | Approve PENDING beneficiary |
| PUT | `/api/beneficiaries/{id}/reject` | `CHECKER` | Reject PENDING beneficiary |
| DELETE | `/api/beneficiaries/{id}` | `ADMIN` or `CHECKER` | Delete beneficiary |

```json
// POST /api/beneficiaries  →  201 Created
{
  "name": "ABC Suppliers",
  "accountNumber": "123456789",
  "bankName": "XYZ Bank",
  "ifscCode": "XYZ0001234",
  "email": "abc@example.com",
  "phone": "9876543210",
  "customerId": 1
}

// Response
{
  "id": 1,
  "name": "ABC Suppliers",
  "accountNumber": "123456789",
  "bankName": "XYZ Bank",
  "ifscCode": "XYZ0001234",
  "status": "PENDING",
  "createdAt": "2026-09-26T10:30:00",
  "customerId": 1,
  "customerName": "Jane Doe"
}
```

---

### Consents — Maker-Checker

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/consents` | `MAKER` | Create a PENDING consent |
| GET | `/api/consents` | Authenticated | List all consents |
| GET | `/api/consents/{id}` | Authenticated | Get consent by ID |
| PUT | `/api/consents/{id}/approve` | `CHECKER` | Approve PENDING consent |
| PUT | `/api/consents/{id}/reject` | `CHECKER` | Reject PENDING consent |

---

## Error Responses

All errors return a consistent JSON envelope:

```json
{
  "status": 404,
  "message": "Beneficiary not found",
  "errors": [],
  "timestamp": "2026-09-26T10:30:00"
}
```

| HTTP Status | Cause |
|---|---|
| 400 | Validation failure or invalid state transition (e.g. approving a non-PENDING record) |
| 401 | Missing or expired JWT |
| 403 | Valid JWT but insufficient role |
| 404 | Resource not found |
| 500 | Unexpected server error |

Validation errors include a field-level `errors` array:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    "email: Invalid email format",
    "phone: Phone must contain exactly 10 digits"
  ],
  "timestamp": "2026-09-26T10:30:00"
}
```

---

## Frontend — Key Flows

### Authentication

1. On app load, `keycloak.init({ onLoad: 'login-required' })` redirects unauthenticated users to Keycloak.
2. After login, the Axios interceptor attaches `Authorization: Bearer <token>` to every API request.
3. Tokens are silently refreshed 30 seconds before expiry. On refresh failure the user is logged out.

### Maker creates a beneficiary

1. Navigates to `/beneficiaries/create`, fills in the form.
2. On success a dedicated screen is shown — **not** a navigation redirect — displaying:
   - "Beneficiary created successfully"
   - Yellow **Status: PENDING** badge
   - Summary of the created record
3. The Maker can then view all beneficiaries or add another.

### Checker reviews beneficiaries

1. Navigates to `/beneficiaries`.
2. The Status column shows color-coded badges:
   - Yellow — PENDING
   - Green — APPROVED
   - Red — REJECTED
3. For PENDING rows only, **Approve** and **Reject** buttons appear (CHECKER role required).
4. After clicking either, the list refreshes automatically.

### Role-based UI

| Feature | MAKER | CHECKER | ADMIN |
|---|---|---|---|
| Add Beneficiary button | Visible | Hidden | Hidden |
| Approve / Reject buttons | Hidden | Visible (PENDING only) | Hidden |
| Add Transaction button | Visible | Hidden | Hidden |
| Transaction approve/reject | Hidden | Visible (PENDING only) | Hidden |
| Create Account button | Hidden | Hidden | Visible |
| Delete Beneficiary | Hidden | Visible | Visible |

---

## Testing the Maker-Checker Flow

| # | Step | Expected |
|---|---|---|
| 1 | Login as MAKER, `POST /api/beneficiaries` | `201 Created`, `status: PENDING` |
| 2 | Check database | Row has `status = 'PENDING'` |
| 3 | Login as CHECKER, `GET /api/beneficiaries` | PENDING beneficiary visible |
| 4 | `PUT /api/beneficiaries/1/approve` | `200 OK`, `status: APPROVED` |
| 5 | Repeat step 4 | `400`, "Only PENDING beneficiaries can be approved" |
| 6 | MAKER creates another beneficiary | `201`, `status: PENDING` |
| 7 | `PUT /api/beneficiaries/2/reject` | `200 OK`, `status: REJECTED` |
| 8 | Try to approve the rejected beneficiary | `400` error |
| 9 | Login as MAKER, `PUT /api/beneficiaries/1/approve` | `403 Forbidden` |
| 10 | Login as MAKER, `PUT /api/beneficiaries/1/reject` | `403 Forbidden` |
| 11 | Call approve with no JWT | `401 Unauthorized` |
