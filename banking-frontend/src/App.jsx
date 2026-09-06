import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/customers/CustomerList";
import Navbar from "./components/Navbar";
import CreateCustomer from "./pages/customers/CreateCustomer";
import AccountList from "./pages/accounts/AccountList";
import AccountDetails from "./pages/accounts/AccountDetails";
import TransactionHistory from "./pages/accounts/TransactionHistory";
import CreateTransaction from "./pages/accounts/CreateTransaction";
import BeneficiaryList from "./pages/beneficiaries/BeneficiaryList";
import CreateBeneficiary from "./pages/beneficiaries/CreateBeneficiary";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/accounts/:accountId" element={<AccountDetails />} />
            <Route path="/accounts/:accountId/transactions" element={<TransactionHistory />} />
            <Route path="/accounts/:accountId/transactions/create" element={<CreateTransaction />} />
            <Route path="/beneficiaries" element={<BeneficiaryList />} />
            <Route path="/beneficiaries/create" element={<CreateBeneficiary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;