# Banking Backend — Implementation Tasks

## Tasks

- [x] 1. Fix Exception Handling
  - Fix `ResourceNotFoundException` to extend `RuntimeException` with a message constructor
  - Create `ErrorResponse` DTO with fields: `status`, `message`, `errors`, `timestamp`
  - Implement `GlobalExceptionHandler` with `@RestControllerAdvice` handling `ResourceNotFoundException` (404), `MethodArgumentNotValidException` (400), `RuntimeException` (400), and `Exception` (500)
  - Update `CustomerServiceImpl` — replace all `throw new RuntimeException(...)` with `throw new ResourceNotFoundException(...)`
  - Update `AccountServiceImpl` — replace all `throw new RuntimeException(...)` with `throw new ResourceNotFoundException(...)`
  - Update `TransactionServiceImpl` — replace entity-not-found `RuntimeException` with `ResourceNotFoundException`; keep the "Insufficient Balance" as `RuntimeException` (caught by the 400 handler)
  - **Acceptance:** `GET /api/customers/999` returns `{"status":404,"message":"Customer not found","errors":[],"timestamp":"..."}`. `POST /api/customers` with empty body returns 400 with field errors list.

- [-] 2. Add Beneficiary Entity and Repository
  - Dependencies: [1]
  - Create `Beneficiary.java` entity with all required fields, `@ManyToOne` to `Customer`, and `@PrePersist` for `createdAt`
  - Create `BeneficiaryRepository.java` extending `JpaRepository<Beneficiary, Long>` with `findByCustomerId`
  - **Acceptance:** App starts without errors and Hibernate creates the `beneficiaries` table in PostgreSQL with a `customer_id` foreign key column.

- [~] 3. Add Beneficiary DTOs, Service, and Controller
  - Dependencies: [2]
  - Create `BeneficiaryRequestDTO` with full validation annotations
  - Create `BeneficiaryResponseDTO` with all response fields including `customerId` and `customerName`
  - Create `BeneficiaryService` interface
  - Create `BeneficiaryServiceImpl` implementing all CRUD operations, using `ResourceNotFoundException` for not-found cases
  - Create `BeneficiaryController` with all 5 endpoints: `POST /api/beneficiaries`, `GET /api/beneficiaries`, `GET /api/beneficiaries/{id}`, `GET /api/beneficiaries/customer/{customerId}`, `DELETE /api/beneficiaries/{id}`
  - **Acceptance:** All 5 endpoints respond correctly. `POST` with missing fields returns 400. `DELETE /api/beneficiaries/999` returns 404. `GET /api/beneficiaries/customer/{customerId}` returns only that customer's beneficiaries.

- [~] 4. Add Health Endpoint and CORS Configuration
  - Dependencies: [1]
  - Create `HealthController.java` with `GET /health` and `GET /api/info`
  - Create `WebConfig.java` implementing `WebMvcConfigurer` with CORS mapped to `/**` allowing origin `http://localhost:5173`, all methods, all headers
  - **Acceptance:** `GET /health` returns `{"status":"UP","service":"Banking API"}`. Response headers include `Access-Control-Allow-Origin`.

- [~] 5. Write README
  - Dependencies: [3, 4]
  - Create `README.md` at project root with: tech stack, prerequisites, database setup, how to run, full API endpoint table (all 19 endpoints), error response format example
  - **Acceptance:** README is complete, accurate, and a new developer can follow it to set up and run the project.
