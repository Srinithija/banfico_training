# Banking Backend — Design

## Architecture

Standard Spring Boot layered architecture:

```
Controller → Service Interface → Service Implementation → Repository → Entity
```

All layers use DTOs (Request/Response) to decouple the API surface from the database schema.

## Package Structure

```
com.banfico.banking_crud_ap
├── BankingCrudApApplication.java
├── config/
│   └── WebConfig.java                  ← CORS configuration
├── controller/
│   ├── HealthController.java           ← NEW
│   ├── CustomerController.java         ← existing
│   ├── AccountController.java          ← existing
│   ├── TransactionController.java      ← existing
│   └── BeneficiaryController.java      ← NEW
├── dto/
│   ├── request/
│   │   ├── CustomerRequestDTO.java     ← existing
│   │   ├── AccountRequestDTO.java      ← existing
│   │   ├── TransactionRequestDTO.java  ← existing
│   │   └── BeneficiaryRequestDTO.java  ← NEW
│   └── response/
│       ├── CustomerResponseDTO.java    ← existing
│       ├── AccountResponseDTO.java     ← existing
│       ├── TransactionResponseDTO.java ← existing
│       ├── BeneficiaryResponseDTO.java ← NEW
│       └── ErrorResponse.java          ← NEW
├── entity/
│   ├── Customer.java                   ← existing
│   ├── Account.java                    ← existing
│   ├── Transaction.java                ← existing
│   └── Beneficiary.java                ← NEW
├── exception/
│   ├── ResourceNotFoundException.java  ← FIX (currently empty)
│   └── GlobalExceptionHandler.java     ← FIX (currently empty)
├── repository/
│   ├── CustomerRepository.java         ← existing
│   ├── AccountRepository.java          ← existing
│   ├── TransactionRepository.java      ← existing
│   └── BeneficiaryRepository.java      ← NEW
└── service/
    ├── CustomerService.java            ← existing
    ├── AccountService.java             ← existing
    ├── TransactionService.java         ← existing
    ├── BeneficiaryService.java         ← NEW
    └── impl/
        ├── CustomerServiceImpl.java    ← UPDATE (fix exceptions)
        ├── AccountServiceImpl.java     ← UPDATE (fix exceptions)
        ├── TransactionServiceImpl.java ← UPDATE (fix exceptions)
        └── BeneficiaryServiceImpl.java ← NEW
```

## Key Design Decisions

### Error Response Format
All errors return this JSON shape:
```json
{
  "status": 404,
  "message": "Customer not found",
  "errors": [],
  "timestamp": "2024-01-15T10:30:00"
}
```
For validation errors, `errors` contains the list of field messages and `message` is "Validation failed".

### Beneficiary Entity Relationships
- `Beneficiary` has `@ManyToOne` to `Customer` — many beneficiaries can belong to one customer
- Foreign key column: `customer_id` in the `beneficiaries` table
- Fetching beneficiaries by customer uses `findByCustomerId(Long customerId)` in the repository

### CORS
Configured via `WebMvcConfigurer` in `WebConfig.java` — allows `http://localhost:5173` (Vite dev server default port) on all paths and methods.

## API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/info | App info |
| POST | /api/customers | Create customer |
| GET | /api/customers | Get all customers |
| GET | /api/customers/{id} | Get customer by ID |
| PUT | /api/customers/{id} | Update customer |
| DELETE | /api/customers/{id} | Delete customer |
| POST | /api/accounts | Create account |
| GET | /api/accounts | Get all accounts |
| GET | /api/accounts/{id} | Get account by ID |
| PUT | /api/accounts/{id} | Update account |
| DELETE | /api/accounts/{id} | Delete account |
| POST | /api/accounts/{accountId}/transactions | Create transaction |
| GET | /api/accounts/{accountId}/transactions | Get transactions by account |
| POST | /api/beneficiaries | Create beneficiary |
| GET | /api/beneficiaries | Get all beneficiaries |
| GET | /api/beneficiaries/{id} | Get beneficiary by ID |
| GET | /api/beneficiaries/customer/{customerId} | Get beneficiaries by customer |
| DELETE | /api/beneficiaries/{id} | Delete beneficiary |
