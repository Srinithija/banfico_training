# Banking CRUD API

A RESTful banking backend built with Spring Boot, Spring Security, and PostgreSQL. Secured with Keycloak JWT authentication and a role-based Maker-Checker workflow for sensitive operations.

Developed as part of the **Banfico University Full-Stack Developer Training Program**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.x |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL 16 |
| Security | Spring Security OAuth2 Resource Server |
| Identity Provider | Keycloak 26 |
| Validation | Jakarta Bean Validation |
| Build Tool | Maven (Maven Wrapper included) |
| Utilities | Lombok |
| Containerization | Docker + Docker Compose |

---

## Architecture Overview

```
React Frontend
      │
      │  HTTP (Bearer JWT)
      ▼
   Nginx (port 8080)
      │
      ├──→ /api/**  →  Spring Boot Backend (internal)
      └──→ /*       →  React Static Files (internal)
               │
               ▼
         PostgreSQL (port 5434)

   Keycloak (port 8180)  ←──  JWT issuer / authenticates users
```

---

## Roles

| Role | Description |
|---|---|
| `ADMIN` | Manages customers and accounts |
| `MAKER` | Initiates transactions, beneficiaries, and consents |
| `CHECKER` | Reviews and approves or rejects PENDING requests |

Roles are defined as **Keycloak realm roles** and extracted from the `realm_access.roles` claim in the JWT by `KeycloakRoleConverter`.

---

## Maker-Checker Workflow

Several sensitive operations require a two-step approval process:

```
MAKER creates request  →  status: PENDING
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        CHECKER approves              CHECKER rejects
              │                               │
              ▼                               ▼
         APPROVED                         REJECTED
```

**Modules with Maker-Checker:**

| Module | MAKER action | CHECKER action |
|---|---|---|
| Transactions | `POST /api/accounts/{id}/transactions` | `PUT .../approve` or `.../reject` |
| Beneficiaries | `POST /api/beneficiaries` | `PUT /api/beneficiaries/{id}/approve` or `.../reject` |
| Consents | `POST /api/consents` | `PUT /api/consents/{id}/approve` or `.../reject` |

**State transition rules:** Only `PENDING → APPROVED` and `PENDING → REJECTED` are valid. Attempting to approve or reject a non-PENDING record returns `400 Bad Request`.

---

## Prerequisites

- Java 21+
- Maven 3.8+ (or use the included `mvnw` wrapper)
- Docker Desktop (for the full stack)
- A running Keycloak instance with `banking-realm` configured

---

## Running with Docker Compose (recommended)

Starts PostgreSQL, Keycloak, the Spring Boot backend, the React frontend, and Nginx together:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Application (via Nginx) | http://localhost:8080 |
| Keycloak Admin Console | http://localhost:8180 |
| PostgreSQL | localhost:5434 |

---

## Running the Backend Locally

```bash
# From the banking-crud-ap directory
./mvnw spring-boot:run
```

The server starts on **http://localhost:8081** (or whatever port is configured).

Make sure PostgreSQL is running and the Keycloak issuer URI is reachable. Update `src/main/resources/application.properties` if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5434/bankdb
spring.datasource.username=postgres
spring.datasource.password=admin123

spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/banking-realm
```

> Hibernate will auto-create or update all tables on startup (`ddl-auto=update`). No manual schema migration is required.

---

## Database Setup (local only)

```sql
CREATE DATABASE bankdb;
```

Tables are created automatically by Hibernate on first run.

---

## Project Structure

```
src/main/java/com/banfico/banking_crud_ap/
├── config/
│   ├── KeycloakRoleConverter.java   # Extracts realm_access.roles from JWT
│   ├── SecurityConfig.java          # Role-based URL authorization rules
│   └── WebConfig.java               # CORS configuration
├── controller/
│   ├── AccountController.java
│   ├── BeneficiaryController.java
│   ├── ConsentController.java
│   ├── CustomerController.java
│   ├── HealthController.java
│   └── TransactionController.java
├── dto/
│   ├── request/                     # Validated request DTOs
│   └── response/                    # Response DTOs + ErrorResponse
├── entity/
│   ├── Account.java
│   ├── Beneficiary.java
│   ├── BeneficiaryStatus.java       # Enum: PENDING, APPROVED, REJECTED
│   ├── Consent.java
│   ├── Customer.java
│   └── Transaction.java
├── exception/
│   ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│   └── ResourceNotFoundException.java
├── repository/                      # Spring Data JPA repositories
└── service/
    ├── impl/                        # Service implementations
    └── *.java                       # Service interfaces
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

**Create Customer — request body:**
```json
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
| PUT | `/api/accounts/{id}` | Authenticated | Update account |
| DELETE | `/api/accounts/{id}` | Authenticated | Delete account |

**Create Account — request body:**
```json
{
  "accountNumber": "ACC001",
  "accountType": "SAVINGS",
  "balance": 5000.00,
  "customerId": 1
}
```

---

### Transactions (Maker-Checker)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/accounts/{accountId}/transactions` | `MAKER` | Create a PENDING transaction |
| GET | `/api/accounts/{accountId}/transactions` | Authenticated | List transactions for account |
| PUT | `/api/accounts/{accountId}/transactions/{txId}/approve` | `CHECKER` | Approve a PENDING transaction |
| PUT | `/api/accounts/{accountId}/transactions/{txId}/reject` | `CHECKER` | Reject a PENDING transaction |

**Create Transaction — request body:**
```json
{
  "amount": 1000.00,
  "transactionType": "DEPOSIT"
}
```

---

### Beneficiaries (Maker-Checker)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/beneficiaries` | `MAKER` | Create a PENDING beneficiary |
| GET | `/api/beneficiaries` | Authenticated | List all beneficiaries |
| GET | `/api/beneficiaries/{id}` | Authenticated | Get beneficiary by ID |
| GET | `/api/beneficiaries/customer/{customerId}` | Authenticated | List beneficiaries for a customer |
| PUT | `/api/beneficiaries/{id}/approve` | `CHECKER` | Approve a PENDING beneficiary |
| PUT | `/api/beneficiaries/{id}/reject` | `CHECKER` | Reject a PENDING beneficiary |
| DELETE | `/api/beneficiaries/{id}` | `ADMIN` or `CHECKER` | Delete a beneficiary |

**Create Beneficiary — request body:**
```json
{
  "name": "ABC Suppliers",
  "accountNumber": "123456789",
  "bankName": "XYZ Bank",
  "ifscCode": "XYZ0001234",
  "email": "abc@example.com",
  "phone": "9876543210",
  "customerId": 1
}
```

**Create Beneficiary — response (201 Created):**
```json
{
  "id": 1,
  "name": "ABC Suppliers",
  "accountNumber": "123456789",
  "bankName": "XYZ Bank",
  "ifscCode": "XYZ0001234",
  "email": "abc@example.com",
  "phone": "9876543210",
  "status": "PENDING",
  "createdAt": "2026-09-26T10:30:00",
  "customerId": 1,
  "customerName": "Jane Doe"
}
```

**Approve Beneficiary — response (200 OK):**
```json
{
  "id": 1,
  "name": "ABC Suppliers",
  "status": "APPROVED",
  ...
}
```

---

### Consents (Maker-Checker)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/consents` | `MAKER` | Create a PENDING consent |
| GET | `/api/consents` | Authenticated | List all consents |
| GET | `/api/consents/{id}` | Authenticated | Get consent by ID |
| PUT | `/api/consents/{id}/approve` | `CHECKER` | Approve a PENDING consent |
| PUT | `/api/consents/{id}/reject` | `CHECKER` | Reject a PENDING consent |

---

## Error Response Format

All errors return a consistent JSON envelope:

```json
{
  "status": 404,
  "message": "Beneficiary not found",
  "errors": [],
  "timestamp": "2026-09-26T10:30:00"
}
```

Validation errors (400):
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

Invalid state transition (400):
```json
{
  "status": 400,
  "message": "Only PENDING beneficiaries can be approved",
  "errors": [],
  "timestamp": "2026-09-26T10:30:00"
}
```

Unauthorized (401): No JWT or expired token — returned by Spring Security before reaching the controller.

Forbidden (403): Valid JWT but insufficient role (e.g. MAKER calling an approve endpoint).

---

## Security

- All endpoints (except `/health`, `/api/info`, and OPTIONS preflight) require a valid Bearer JWT.
- JWTs are issued by Keycloak and validated against the configured issuer URI.
- Roles are extracted from `realm_access.roles` in the JWT claim — no Spring-side role mapping is required.
- Role enforcement is done at the URL level in `SecurityConfig` — controller methods carry no `@PreAuthorize` annotations.
- Frontend button hiding is **not** the security boundary. Backend returns `403 Forbidden` for any role violation regardless of the UI state.

---

## Testing the Maker-Checker Flow (Postman)

1. Get a token for MAKER from Keycloak (password grant or device flow).
2. `POST /api/beneficiaries` with Bearer token → expect `201`, `status: PENDING`.
3. Get a token for CHECKER.
4. `PUT /api/beneficiaries/1/approve` with CHECKER token → expect `200`, `status: APPROVED`.
5. Retry step 4 → expect `400`, `"Only PENDING beneficiaries can be approved"`.
6. `PUT /api/beneficiaries/1/approve` with MAKER token → expect `403 Forbidden`.
7. `PUT /api/beneficiaries/1/approve` with no token → expect `401 Unauthorized`.
