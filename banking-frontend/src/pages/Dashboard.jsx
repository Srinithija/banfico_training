import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import keycloak from "../auth/keycloak";
import { hasRole } from "../auth/roles";
import api from "../services/api";

function Dashboard() {
  const username = keycloak.tokenParsed?.preferred_username;

  const isAdmin = hasRole("ADMIN");
  const isMaker = hasRole("MAKER");
  const isChecker = hasRole("CHECKER");

  const role = isAdmin
    ? "ADMIN"
    : isMaker
    ? "MAKER"
    : isChecker
    ? "CHECKER"
    : "USER";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    pendingApprovals: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [pendingConsents, setPendingConsents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [customersRes, accountsRes, consentsRes] = await Promise.all([
        api.get("/customers").catch(() => ({ data: [] })),
        api.get("/accounts").catch(() => ({ data: [] })),
        api.get("/consents").catch(() => ({ data: [] })),
      ]);

      const accounts = accountsRes.data || [];
      const allTransactions = [];
      const allPendingTransactions = [];

      for (const account of accounts) {
        try {
          const transactionsRes = await api.get(`/accounts/${account.id}/transactions`);
          const transactions = transactionsRes.data || [];
          allTransactions.push(...transactions);
          allPendingTransactions.push(
            ...transactions.filter((t) => t.status === "PENDING")
          );
        } catch (err) {
          console.error(`Failed to fetch transactions for account ${account.id}`);
        }
      }

      const consents = consentsRes.data || [];
      const pendingConsents = consents.filter((c) => c.status === "PENDING");

      setStats({
        totalCustomers: customersRes.data?.length || 0,
        totalAccounts: accounts.length,
        totalTransactions: allTransactions.length,
        pendingApprovals: allPendingTransactions.length + pendingConsents.length,
      });

      setRecentTransactions(allTransactions.slice(0, 5));
      setPendingTransactions(allPendingTransactions);
      setPendingConsents(pendingConsents);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (accountId, transactionId) => {
    try {
      await api.put(`/accounts/${accountId}/transactions/${transactionId}/approve`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to approve transaction");
    }
  };

  const handleRejectTransaction = async (accountId, transactionId) => {
    try {
      await api.put(`/accounts/${accountId}/transactions/${transactionId}/reject`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to reject transaction");
    }
  };

  const handleApproveConsent = async (consentId) => {
    try {
      await api.put(`/consents/${consentId}/approve`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to approve consent");
    }
  };

  const handleRejectConsent = async (consentId) => {
    try {
      await api.put(`/consents/${consentId}/reject`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to reject consent");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
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
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {username}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Role: <span className="font-semibold">{role}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Accounts</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalAccounts}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 001 1h1M4 4h16v12a1 1 0 001 1h1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No transactions found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {transaction.transactionType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        ₹{Number(transaction.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
                          {transaction.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pending Approvals - CHECKER Only */}
      {isChecker && (pendingTransactions.length > 0 || pendingConsents.length > 0) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pending Approvals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Transactions */}
            {pendingTransactions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Transactions</h3>
                <div className="space-y-4">
                  {pendingTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">
                          #{transaction.id}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {transaction.transactionType} • ₹{Number(transaction.amount).toLocaleString("en-IN")}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApproveTransaction(transaction.accountId, transaction.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTransaction(transaction.accountId, transaction.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Consents */}
            {pendingConsents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Consents</h3>
                <div className="space-y-4">
                  {pendingConsents.map((consent) => (
                    <div
                      key={consent.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">
                          #{consent.id}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(consent.status)}`}>
                          {consent.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{consent.purpose}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApproveConsent(consent.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectConsent(consent.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isMaker && (
            <>
              <Link
                to="/accounts"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-medium text-slate-900">Create Transaction</span>
              </Link>
              <Link
                to="/consents/create"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-slate-900">Create Consent</span>
              </Link>
            </>
          )}
          {isChecker && (
            <>
              <Link
                to="/accounts"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-medium text-slate-900">Review Transactions</span>
              </Link>
              <Link
                to="/consents"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-slate-900">Review Consents</span>
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                to="/customers"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-medium text-slate-900">Customers</span>
              </Link>
              <Link
                to="/accounts"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-medium text-slate-900">Accounts</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;