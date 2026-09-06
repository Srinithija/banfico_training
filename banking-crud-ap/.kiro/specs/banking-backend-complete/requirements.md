# Banking Backend — Complete Implementation Requirements

## Overview
Complete and fix the existing Spring Boot banking backend to fully satisfy Week 1 and Week 2 internship requirements. The backend must implement all four banking domain entities (Customer, Bank Account, Transaction, Beneficiary) with full CRUD APIs, proper exception handling, request validation, and PostgreSQL persistence.

## Requirements

### REQ-1: Exception Handling
- REQ-1.1: `ResourceNotFoundException` must extend `RuntimeException` with a constructor that accepts a `String message`
- REQ-1.2: An `ErrorResponse` DTO must exist with fields: `int status`, `String message`, `List<String> errors`, `LocalDateTime timestamp`
- REQ-1.3: `GlobalExceptionHandler` must be annotated with `@RestControllerAdvice` and handle:
  - `ResourceNotFoundException` → HTTP 404 with error message
  - `MethodArgumentNotValidException` → HTTP 400 with list of field validation errors
  - `RuntimeException` → HTTP 400 with the exception message (for business errors like insufficient balance)
  - `Exception` → HTTP 500 with generic message
- REQ-1.4: All service implementations must throw `ResourceNotFoundException` (not `RuntimeException`) for entity-not-found cases
- REQ-1.5: All error responses must follow the `ErrorResponse` JSON shape consistently

### REQ-2: Beneficiary Entity and Repository
- REQ-2.1: A `Beneficiary` JPA entity must exist with fields: `id` (auto-generated), `name`, `accountNumber`, `bankName`, `ifscCode`, `email`, `phone`, `createdAt`, and a `@ManyToOne` relationship to `Customer`
- REQ-2.2: The entity must map to a `beneficiaries` table in PostgreSQL
- REQ-2.3: `createdAt` must be set automatically via `@PrePersist`
- REQ-2.4: `BeneficiaryRepository` must extend `JpaRepository<Beneficiary, Long>` and include a `findByCustomerId(Long customerId)` method

### REQ-3: Beneficiary API
- REQ-3.1: `POST /api/beneficiaries` — create a new beneficiary linked to a customer; return 200 with `BeneficiaryResponseDTO`
- REQ-3.2: `GET /api/beneficiaries` — return all beneficiaries
- REQ-3.3: `GET /api/beneficiaries/{id}` — return one beneficiary by ID; return 404 if not found
- REQ-3.4: `GET /api/beneficiaries/customer/{customerId}` — return all beneficiaries for a given customer
- REQ-3.5: `DELETE /api/beneficiaries/{id}` — delete a beneficiary; return 404 if not found
- REQ-3.6: `BeneficiaryRequestDTO` must validate: `name` (not blank), `accountNumber` (not blank), `bankName` (not blank), `ifscCode` (not blank), `email` (valid email format, not blank), `phone` (10-digit pattern), `customerId` (not null)
- REQ-3.7: `BeneficiaryResponseDTO` must include: `id`, `name`, `accountNumber`, `bankName`, `ifscCode`, `email`, `phone`, `createdAt`, `customerId`, `customerName`

### REQ-4: Health and Info Endpoints
- REQ-4.1: `GET /health` must return `{ "status": "UP", "service": "Banking API" }` with HTTP 200
- REQ-4.2: `GET /api/info` must return `{ "application": "Banking CRUD API", "version": "1.0.0", "description": "Banfico internship banking backend" }` with HTTP 200

### REQ-5: CORS Configuration
- REQ-5.1: The backend must allow cross-origin requests from `http://localhost:5173`
- REQ-5.2: All HTTP methods (GET, POST, PUT, DELETE, OPTIONS) must be allowed
- REQ-5.3: All headers must be allowed
- REQ-5.4: CORS must apply to all paths (`/**`)

### REQ-6: README
- REQ-6.1: A `README.md` must exist at the project root
- REQ-6.2: It must cover: tech stack, prerequisites, database setup instructions, how to run the app, full API endpoint table, and error response format
