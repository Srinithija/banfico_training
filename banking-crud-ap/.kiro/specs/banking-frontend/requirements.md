# Banking Frontend — Requirements

## Overview
Build a complete React frontend for the banking backend API. The app uses Vite + React + Tailwind CSS, lives in a separate `banking-frontend/` folder alongside the Spring Boot project, and communicates with the backend at `http://localhost:8080`.

## Requirements

### REQ-1: Project Setup
- REQ-1.1: The frontend must be scaffolded with Vite (`npm create vite@latest banking-frontend -- --template react`) inside `c:\Users\SRINITHIJA\Documents\Banifico\week 2\`
- REQ-1.2: Dependencies to install: `tailwindcss`, `@tailwindcss/vite`, `react-router-dom`, `axios`
- REQ-1.3: Tailwind CSS must be configured via `@tailwindcss/vite` plugin in `vite.config.js` and imported in `src/index.css` with `@import "tailwindcss"`
- REQ-1.4: An axios instance must exist at `src/api/axiosInstance.js` with `baseURL: http://localhost:8080`
- REQ-1.5: API service files must exist: `src/api/customerApi.js`, `src/api/accountApi.js`, `src/api/transactionApi.js`, `src/api/beneficiaryApi.js`
- REQ-1.6: React Router must be configured in `src/App.jsx` with all application routes

### REQ-2: Authentication (UI only)
- REQ-2.1: A login page must exist at `/login` with email and password fields
- REQ-2.2: Valid credentials are hardcoded: email `admin@bank.com`, password `admin123`
- REQ-2.3: On successful login, store `isLoggedIn=true` in localStorage and redirect to `/dashboard`
- REQ-2.4: On failed login, show an inline error message: "Invalid email or password"
- REQ-2.5: An `AuthGuard` component must wrap all protected routes — if not logged in, redirect to `/login`
- REQ-2.6: A logout button in the sidebar must clear localStorage and redirect to `/login`
- REQ-2.7: The app must default-redirect from `/` to `/login`

### REQ-3: Layout
- REQ-3.1: All authenticated pages must use a shared layout with a sidebar and main content area
- REQ-3.2: The sidebar must contain navigation links to: Dashboard, Customers, Accounts, Beneficiaries
- REQ-3.3: The active route must be visually highlighted in the sidebar
- REQ-3.4: The sidebar must show the app name "BankApp" at the top and a logout button at the bottom

### REQ-4: Dashboard Page (`/dashboard`)
- REQ-4.1: Must show 4 summary cards: Total Customers, Total Accounts, Total Balance, Total Beneficiaries
- REQ-4.2: Data must be fetched live from the backend APIs on page load
- REQ-4.3: Total Balance is the sum of all account balances
- REQ-4.4: Must show a loading spinner while data is fetching
- REQ-4.5: Must show an error message if any API call fails
- REQ-4.6: Must show a "Recent Accounts" table with the last 5 accounts (accountNumber, type, balance, customerName)

### REQ-5: Customer Pages
- REQ-5.1: `GET /customers` — table listing all customers with columns: ID, Full Name, Email, Phone, Address, Created At, Actions (Edit, Delete)
- REQ-5.2: A "+ New Customer" button navigates to the create form
- REQ-5.3: Create form at `/customers/new` with fields: fullName, email, phone, address — all validated before submit
- REQ-5.4: Edit form at `/customers/:id/edit` — prefills from `GET /api/customers/:id`, submits `PUT /api/customers/:id`
- REQ-5.5: Delete with a confirmation dialog before calling `DELETE /api/customers/:id`
- REQ-5.6: After create/edit/delete, navigate back to the list and refresh data
- REQ-5.7: Show API error messages in an alert/banner in the UI

### REQ-6: Account Pages
- REQ-6.1: `/accounts` — table of all accounts: Account Number, Type, Balance, Customer Name, Actions (View, Edit, Delete)
- REQ-6.2: Create form at `/accounts/new` — fields: accountNumber, accountType (SAVINGS/CURRENT dropdown), balance, customerId (dropdown of customers)
- REQ-6.3: Edit form at `/accounts/:id/edit` — prefill and update
- REQ-6.4: Detail page at `/accounts/:id` — shows account info + full transaction history table (amount, type, date)
- REQ-6.5: Detail page has a "New Transaction" form section: amount input + DEPOSIT/WITHDRAW select + Submit
- REQ-6.6: After a transaction, the account balance and transaction list must refresh automatically
- REQ-6.7: If a WITHDRAW fails due to insufficient funds, show the error message from the backend

### REQ-7: Beneficiary Pages
- REQ-7.1: `/beneficiaries` — table of all beneficiaries: Name, Account Number, Bank Name, IFSC, Email, Phone, Customer, Actions (Delete)
- REQ-7.2: A "+ Add Beneficiary" button navigates to `/beneficiaries/new`
- REQ-7.3: Create form — fields: name, accountNumber, bankName, ifscCode, email, phone, customerId (dropdown)
- REQ-7.4: Delete with confirmation dialog
- REQ-7.5: A customer filter dropdown on the list page to filter beneficiaries by customer

### REQ-8: Error Handling
- REQ-8.1: All pages must show a loading spinner during API calls
- REQ-8.2: All API errors must be displayed as readable messages in the UI — not just console logs
- REQ-8.3: A 404 page must exist for unknown routes
- REQ-8.4: Form validation errors must be shown inline next to the relevant field
