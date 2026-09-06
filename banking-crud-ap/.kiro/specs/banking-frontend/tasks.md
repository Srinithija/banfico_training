# Banking Frontend — Tasks

## Tasks

- [ ] 1. Bootstrap Project, Tailwind, Routing, and API Layer
  - Scaffold Vite React project at `c:\Users\SRINITHIJA\Documents\Banifico\week 2\banking-frontend`
  - Install dependencies: tailwindcss @tailwindcss/vite react-router-dom axios
  - Configure Tailwind in vite.config.js using @tailwindcss/vite plugin
  - Add `@import "tailwindcss"` to src/index.css
  - Create src/api/axiosInstance.js with baseURL http://localhost:8080
  - Create src/api/customerApi.js with: getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer
  - Create src/api/accountApi.js with: getAccounts, getAccountById, createAccount, updateAccount, deleteAccount
  - Create src/api/transactionApi.js with: getTransactions, createTransaction
  - Create src/api/beneficiaryApi.js with: getBeneficiaries, getBeneficiaryById, getBeneficiariesByCustomer, createBeneficiary, deleteBeneficiary
  - Set up App.jsx with BrowserRouter and placeholder routes for all pages
  - **Acceptance:** `npm run dev` starts without errors at http://localhost:5173

- [ ] 2. Login Page and Auth Guard
  - Dependencies: [1]
  - Create src/components/AuthGuard.jsx — checks localStorage isLoggedIn, redirects to /login if false
  - Create src/pages/LoginPage.jsx — email + password form, hardcoded credentials (admin@bank.com / admin123), error message on failure, sets localStorage on success and navigates to /dashboard
  - Add / → /login redirect in App.jsx
  - Wrap all non-login routes with AuthGuard in App.jsx
  - **Acceptance:** Visiting / or /dashboard while logged out redirects to /login. Correct credentials go to /dashboard. Wrong credentials show error.

- [ ] 3. Layout and Sidebar
  - Dependencies: [2]
  - Create src/components/Spinner.jsx — centered loading spinner using Tailwind animate-spin
  - Create src/components/ConfirmDialog.jsx — modal overlay with "Are you sure?" message, Confirm and Cancel buttons
  - Create src/components/Sidebar.jsx — dark sidebar (bg-slate-800) with: "BankApp" title at top, nav links (Dashboard /dashboard, Customers /customers, Accounts /accounts, Beneficiaries /beneficiaries) with active highlight using NavLink, Logout button at bottom that clears localStorage and navigates to /login
  - Create src/components/Layout.jsx — flex container with Sidebar on left (fixed width) and main content area on right (flex-1 overflow-auto p-6 bg-gray-50)
  - Update App.jsx to wrap all protected routes inside Layout
  - **Acceptance:** All protected pages show the sidebar. Active link is highlighted. Logout works.

- [ ] 4. Dashboard Page
  - Dependencies: [3]
  - Create src/pages/DashboardPage.jsx
  - On mount: call getCustomers, getAccounts, getBeneficiaries in parallel using Promise.all
  - Calculate: totalCustomers = customers.length, totalAccounts = accounts.length, totalBalance = sum of all account balances, totalBeneficiaries = beneficiaries.length
  - Show 4 stat cards in a grid (2 cols on mobile, 4 on desktop): each card has an icon area, label, and large number
  - Show a "Recent Accounts" table below the cards — last 5 accounts showing accountNumber, accountType, balance (formatted as currency), customerName
  - Show Spinner while loading, error alert if any call fails
  - **Acceptance:** Dashboard loads real data from backend. All 4 cards show correct counts/totals.

- [ ] 5. Customer Pages
  - Dependencies: [3]
  - Create src/pages/customers/CustomersPage.jsx:
    - Fetch and display all customers in a table
    - Columns: ID, Full Name, Email, Phone, Address, Created At, Actions
    - Actions: Edit button (navigates to /customers/:id/edit), Delete button (shows ConfirmDialog, then calls deleteCustomer)
    - "+ New Customer" button at top right navigates to /customers/new
    - Show Spinner while loading, error alert on failure
  - Create src/pages/customers/CustomerFormPage.jsx:
    - Detect mode: if URL has :id param → edit mode (prefetch customer, PUT on submit), else create mode (POST on submit)
    - Fields: fullName (required), email (required, email format), phone (required, 10 digits), address (required)
    - Show inline validation errors before API call
    - Show API error banner if backend returns error
    - On success: navigate to /customers
  - **Acceptance:** Full CRUD working. Create/edit/delete all update the list correctly. Validation prevents empty submits.

- [ ] 6. Account Pages
  - Dependencies: [3]
  - Create src/pages/accounts/AccountsPage.jsx:
    - Table with columns: Account Number, Type, Balance, Customer Name, Actions (View, Edit, Delete)
    - View navigates to /accounts/:id, Edit to /accounts/:id/edit
    - Delete with ConfirmDialog
    - "+ New Account" button
  - Create src/pages/accounts/AccountFormPage.jsx:
    - Fields: accountNumber, accountType (select: SAVINGS / CURRENT), balance (number), customerId (select dropdown populated from getCustomers)
    - Edit mode prefills values
    - On success navigate to /accounts
  - Create src/pages/accounts/AccountDetailPage.jsx:
    - Top section: account info card (accountNumber, type, balance prominently displayed, customerName)
    - Bottom section: transaction history table (Amount, Type, Date) — fetch from getTransactions(accountId)
    - "New Transaction" form below the table: amount (number input), transactionType (DEPOSIT / WITHDRAW select), Submit button
    - On transaction submit: call createTransaction, then re-fetch account and transactions to refresh balance and list
    - Show backend error (e.g., "Insufficient Balance") as red alert
  - **Acceptance:** Account list, create, edit, delete all work. Detail page shows live balance + transaction history. Deposit/withdraw updates balance immediately.

- [ ] 7. Beneficiary Pages
  - Dependencies: [3]
  - Create src/pages/beneficiaries/BeneficiariesPage.jsx:
    - Fetch all beneficiaries on load
    - Table columns: Name, Account Number, Bank Name, IFSC, Email, Phone, Customer Name, Actions (Delete)
    - Customer filter dropdown at top — populated from getCustomers — filters the table client-side
    - Delete with ConfirmDialog
    - "+ Add Beneficiary" button navigates to /beneficiaries/new
  - Create src/pages/beneficiaries/BeneficiaryFormPage.jsx:
    - Fields: name, accountNumber, bankName, ifscCode, email, phone, customerId (dropdown from getCustomers)
    - All fields required with inline validation
    - On success navigate to /beneficiaries
  - **Acceptance:** Add and delete beneficiaries work. Customer filter correctly filters the table.

- [ ] 8. Polish and Frontend README
  - Dependencies: [4, 5, 6, 7]
  - Add a NotFoundPage.jsx (simple 404 message with link back to /dashboard) and add `path="*"` route in App.jsx
  - Ensure all pages show Spinner during loading and readable error messages on API failure
  - Ensure sidebar active link highlight works correctly on all routes
  - Write banking-frontend/README.md covering: prerequisites (Node 18+), how to install (npm install), how to run (npm run dev), backend requirement (Spring Boot must be running on port 8080), all pages listed
  - **Acceptance:** No page crashes. Unknown routes show 404 page. All flows work end to end with backend running.
