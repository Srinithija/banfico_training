# Banking Frontend — Design

## Architecture

Vite + React SPA with React Router for client-side routing. Axios handles all API communication. Tailwind CSS for styling. No state management library — local component state with `useState` and `useEffect` is sufficient.

## Project Structure

```
banking-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js       # Axios base instance (baseURL: http://localhost:8080)
│   │   ├── customerApi.js         # Customer API calls
│   │   ├── accountApi.js          # Account API calls
│   │   ├── transactionApi.js      # Transaction API calls
│   │   └── beneficiaryApi.js      # Beneficiary API calls
│   ├── components/
│   │   ├── Layout.jsx             # Sidebar + main content wrapper
│   │   ├── Sidebar.jsx            # Navigation sidebar with active link highlight
│   │   ├── AuthGuard.jsx          # Redirects to /login if not authenticated
│   │   ├── Spinner.jsx            # Loading spinner component
│   │   └── ConfirmDialog.jsx      # Reusable delete confirmation dialog
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── customers/
│   │   │   ├── CustomersPage.jsx
│   │   │   └── CustomerFormPage.jsx
│   │   ├── accounts/
│   │   │   ├── AccountsPage.jsx
│   │   │   ├── AccountFormPage.jsx
│   │   │   └── AccountDetailPage.jsx
│   │   └── beneficiaries/
│   │       ├── BeneficiariesPage.jsx
│   │       └── BeneficiaryFormPage.jsx
│   ├── App.jsx                    # Router configuration
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind import
├── index.html
├── vite.config.js
└── package.json
```

## Routing Structure

```
/                         → redirect to /login
/login                    → LoginPage (public)
/dashboard                → DashboardPage (protected)
/customers                → CustomersPage (protected)
/customers/new            → CustomerFormPage (create mode)
/customers/:id/edit       → CustomerFormPage (edit mode)
/accounts                 → AccountsPage (protected)
/accounts/new             → AccountFormPage (create mode)
/accounts/:id             → AccountDetailPage (protected)
/accounts/:id/edit        → AccountFormPage (edit mode)
/beneficiaries            → BeneficiariesPage (protected)
/beneficiaries/new        → BeneficiaryFormPage (protected)
*                         → 404 NotFoundPage
```

## Authentication

Simple localStorage-based auth guard. No JWT. `AuthGuard` component checks `localStorage.getItem('isLoggedIn') === 'true'`. Protected routes are wrapped with `<AuthGuard>`. Login sets it; logout clears it.

## API Layer

Each API file exports named async functions:

```js
// customerApi.js
export const getCustomers = () => axiosInstance.get('/api/customers')
export const getCustomerById = (id) => axiosInstance.get(`/api/customers/${id}`)
export const createCustomer = (data) => axiosInstance.post('/api/customers', data)
export const updateCustomer = (id, data) => axiosInstance.put(`/api/customers/${id}`, data)
export const deleteCustomer = (id) => axiosInstance.delete(`/api/customers/${id}`)
```

## Styling Approach

- Tailwind utility classes throughout — no custom CSS files
- Sidebar: dark navy background (`bg-slate-800`), white text
- Cards: white background, rounded, shadow
- Buttons: `bg-blue-600 hover:bg-blue-700` for primary, `bg-red-500 hover:bg-red-600` for delete
- Tables: striped rows with `even:bg-gray-50`
- Forms: white card with labeled inputs, full-width on mobile
