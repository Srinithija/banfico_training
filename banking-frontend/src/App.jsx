import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { hasRole } from "./auth/roles";

// ── Staff pages ───────────────────────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/customers/CustomerList";
import CreateCustomer from "./pages/customers/CreateCustomer";
import AccountList from "./pages/accounts/AccountList";
import CreateAccount from "./pages/accounts/CreateAccount";
import AccountDetails from "./pages/accounts/AccountDetails";
import TransactionHistory from "./pages/accounts/TransactionHistory";
import CreateTransaction from "./pages/accounts/CreateTransaction";
import BeneficiaryList from "./pages/beneficiaries/BeneficiaryList";
import CreateBeneficiary from "./pages/beneficiaries/CreateBeneficiary";
import ConsentList from "./pages/consents/ConsentList";
import CreateConsent from "./pages/consents/CreateConsent";

// ── Customer self-service portal pages ────────────────────────────────────────
import MyAccount from "./pages/portal/MyAccount";
import MyTransactions from "./pages/portal/MyTransactions";
import MyBeneficiaries from "./pages/portal/MyBeneficiaries";
import AccountRequestsAdmin from "./pages/accounts/AccountRequestsAdmin";

// ── Root redirect — sends each role to the correct home page ─────────────────
// CUSTOMER → /portal/my-account
// Staff    → /dashboard
function RootRedirect() {
  if (hasRole("CUSTOMER")) {
    return <Navigate to="/portal/my-account" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>

            {/* ── Root: redirect based on role ─────────────────────────────── */}
            <Route path="/" element={<RootRedirect />} />

            {/* ── Staff routes ─────────────────────────────────────────────── */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/accounts/create" element={<CreateAccount />} />
            <Route path="/accounts/:accountId/transactions/create" element={<CreateTransaction />} />
            <Route path="/accounts/:accountId/transactions" element={<TransactionHistory />} />
            <Route path="/accounts/:accountId" element={<AccountDetails />} />
            <Route path="/beneficiaries" element={<BeneficiaryList />} />
            <Route path="/beneficiaries/create" element={<CreateBeneficiary />} />
            <Route path="/consents" element={<ConsentList />} />
            <Route path="/consents/create" element={<CreateConsent />} />

            {/* ── Customer self-service portal ──────────────────────────────── */}
            <Route path="/portal/my-account"       element={<MyAccount />} />
            <Route path="/portal/my-transactions"  element={<MyTransactions />} />
            <Route path="/portal/my-beneficiaries" element={<MyBeneficiaries />} />

            {/* ── Account requests (admin) ──────────────────────────────────── */}
            <Route path="/account-requests" element={<AccountRequestsAdmin />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
