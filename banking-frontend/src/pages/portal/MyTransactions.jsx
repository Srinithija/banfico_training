import { useEffect, useState } from "react";
import api from "../../services/api";

function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New transaction form
  const [form, setForm] = useState({ amount: "", transactionType: "DEPOSIT" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/customer/my-transactions");
      setTransactions(res.data);
    } catch {
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      await api.post("/customer/my-transactions", {
        amount: parseFloat(form.amount),
        transactionType: form.transactionType,
      });
      setFormSuccess(
        `${form.transactionType === "DEPOSIT" ? "Deposit" : "Withdrawal"} of ₹${parseFloat(form.amount).toLocaleString("en-IN")} successful.`
      );
      setForm({ amount: "", transactionType: "DEPOSIT" });
      fetchTransactions(); // refresh the list
    } catch (err) {
      const data = err.response?.data;
      if (data?.message) {
        setFormError(data.message);
      } else {
        setFormError("Transaction failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800 border border-green-200";
      case "PENDING":  return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "REJECTED": return "bg-red-100 text-red-800 border border-red-200";
      default:         return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Transactions</h1>
        <p className="mt-1 text-slate-500">Deposit or withdraw money and view your history</p>
      </div>

      {/* ── New Transaction Form ──────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">New Transaction</h2>

        {formSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {formSuccess}
          </div>
        )}

        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Type */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select
              value={form.transactionType}
              onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAW">Withdraw</option>
            </select>
          </div>

          {/* Amount */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter amount"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2.5 rounded-xl text-white font-medium transition-colors shadow-sm disabled:opacity-50 ${
              form.transactionType === "WITHDRAW"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting ? "Processing..." : form.transactionType === "DEPOSIT" ? "Deposit" : "Withdraw"}
          </button>
        </form>
      </div>

      {/* ── Transaction History ───────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Transaction History</h2>

      {loading ? (
        <div className="text-slate-500 py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
          No transactions yet. Make your first deposit above.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">#{tx.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-medium ${
                        tx.transactionType === "DEPOSIT" ? "text-green-700" : "text-orange-600"
                      }`}>
                        {tx.transactionType === "DEPOSIT" ? "↑" : "↓"} {tx.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {tx.transactionDate
                        ? new Date(tx.transactionDate).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTransactions;
