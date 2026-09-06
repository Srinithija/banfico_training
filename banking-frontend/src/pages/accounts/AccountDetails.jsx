import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { hasRole } from "../../auth/roles";

function AccountDetails() {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 const isMaker = hasRole("MAKER");
  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  const fetchAccount = async () => {
    try {
      const response = await api.get(`/accounts/${accountId}`);
      setAccount(response.data);
    } catch (error) {
      console.error("Account Details Error:", error);
      setError("Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-600">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-lg">Loading account...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
        {error}
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <h3 className="text-lg font-medium text-slate-900">Account not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back + Header */}
      <div className="mb-8">
        <Link
          to="/accounts"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Accounts
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Account Details</h1>
        <p className="mt-1 text-slate-500">Account #{account.accountNumber}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white mb-6 shadow-lg">
        <p className="text-slate-300 text-sm font-medium mb-1">Available Balance</p>
        <p className="text-4xl font-bold tracking-tight">
          ₹{Number(account.balance).toLocaleString("en-IN")}
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200">
            {account.accountType}
          </span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Account Information</h2>
        </div>
        <div className="divide-y divide-slate-200">
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-slate-500">Account ID</span>
            <span className="text-sm font-medium text-slate-900">#{account.id}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-slate-500">Account Number</span>
            <span className="text-sm font-medium text-slate-900">{account.accountNumber}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-slate-500">Account Type</span>
            <span className="text-sm font-medium text-slate-900">{account.accountType}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-slate-500">Customer ID</span>
            <span className="text-sm font-medium text-slate-900">#{account.customerId}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-slate-500">Customer Name</span>
            <span className="text-sm font-medium text-slate-900">{account.customerName}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to={`/accounts/${account.id}/transactions`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Transactions
        </Link>
{isMaker && (
  <Link
    to={`/accounts/${account.id}/transactions/create`}
    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    New Transaction
  </Link>
)}
      </div>
    </div>
  );
}

export default AccountDetails;