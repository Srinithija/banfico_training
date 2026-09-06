# Banking CRUD API

A RESTful banking backend built with Spring Boot, JPA/Hibernate, and PostgreSQL. Developed as part of the Banfico University Full-Stack Developer Training Program.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 4.1.x |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Validation | Jakarta Bean Validation |
| Build Tool | Maven |
| Utilities | Lombok |

---

## Prerequisites

- Java 21+
- Maven 3.8+
- PostgreSQL 14+

---

## Database Setup

1. Open PostgreSQL and create the database:
```sql
CREATE DATABASE bankdb;
```

2. Open `src/main/resources/application.properties` and update the credentials if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5434/bankdb
spring.datasource.username=postgres
spring.datasource.password=admin123
```

> Hibernate will auto-create all tables on first run (`ddl-auto=update`).

---

## How to Run

```bash
# Clone the repository
git clone <your-repo-url>
cd banking-crud-ap

# Run the application
./mvnw spring-boot:run
```

The server starts on **http://localhost:8080**

---

## API Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check — returns status UP |
| GET | `/api/info` | Application info |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers` | Create a new customer |
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts` | Create a new account |
| GET | `/api/accounts` | Get all accounts |
| GET | `/api/accounts/{id}` | Get account by ID |
| PUT | `/api/accounts/{id}` | Update account |
| DELETE | `/api/accounts/{id}` | Delete account |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/{accountId}/transactions` | Create a DEPOSIT or WITHDRAW transaction |
| GET | `/api/accounts/{accountId}/transactions` | Get all transactions for an account |

### Beneficiaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/beneficiaries` | Add a new beneficiary |
| GET | `/api/beneficiaries` | Get all beneficiaries |
| GET | `/api/beneficiaries/{id}` | Get beneficiary by ID |
| GET | `/api/beneficiaries/customer/{customerId}` | Get all beneficiaries for a customer |
| DELETE | `/api/beneficiaries/{id}` | Delete a beneficiary |

---

## Request / Response Examples

### Create Customer
**POST** `/api/customers`
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "address": "123 Main Street"
}
```

### Create Account
**POST** `/api/accounts`
```json
{
  "accountNumber": "ACC001",
  "accountType": "SAVINGS",
  "balance": 5000.00,
  "customerId": 1
}
```

### Create Transaction
**POST** `/api/accounts/1/transactions`
```json
{
  "amount": 1000.00,
  "transactionType": "DEPOSIT"
}
```

### Add Beneficiary
**POST** `/api/beneficiaries`
```json
{
  "name": "John Smith",
  "accountNumber": "BEN123456",
  "bankName": "HDFC Bank",
  "ifscCode": "HDFC0001234",
  "email": "john@example.com",
  "phone": "9876543210",
  "customerId": 1
}
```

---

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "status": 404,
  "message": "Customer not found",
  "errors": [],
  "timestamp": "2024-01-15T10:30:00"
}
```

For validation errors (400):
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    "email: Invalid email format",
    "fullName: Full name is required"
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## Project Structure

```
src/main/java/com/banfico/banking_crud_ap/
├── config/          # CORS and web configuration
├── controller/      # REST API controllers
├── dto/
│   ├── request/     # Request DTOs with validation
│   └── response/    # Response DTOs and ErrorResponse
├── entity/          # JPA entities (Customer, Account, Transaction, Beneficiary)
├── exception/       # GlobalExceptionHandler, ResourceNotFoundException
├── repository/      # Spring Data JPA repositories
└── service/
    ├── impl/        # Service implementations
    └── *.java       # Service interfaces
```

---

## Git

Clean commits following the feature-per-commit approach. Each week's implementation is tracked separately.
