import { useEffect, useState } from "react";
import api from "../../services/api";

function MyAccount() {
  const [accounts, setAccounts]     = useState([]);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  // ── Apply for account form ────────────────────────────────────────────────
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ accountType: "CURRENT", notes: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError]       = useState("");
  const [formSuccess, setFormSuccess]   = useState("");

  const fetchData = async () => {
    try {
      const [accRes, reqRes] = await Promise.all([
        api.get("/customer/my-account"),
        api.get("/account-requests/my"),
      ]);
      setAccounts(accRes.data);
      setRequests(reqRes.data);
    } catch {
      setError("Failed to load account data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess(""); setFormSubmitting(true);
    try {
      await api.post("/account-requests", form);
      setFormSuccess(
        `Your ${form.accountType} account application has been submitted. ` +
        `An admin will review it shortly.`
      );
      setForm({ accountType: "CURRENT", notes: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      setFormError(data?.message || "Failed to submit application.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":        return "bg-green-100 text-green-800 border border-green-200";
      case "PENDING_APPROVAL": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "REJECTED":        return "bg-red-100 text-red-800 border border-red-200";
      default:                return "bg-slate-100 text-slate-700 border border-slate-200";
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
          <span className="text-lg">Loading your account...</span>
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

  return (
    <div className="max-w-2xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
          <p className="mt-1 text-slate-500">Your bank accounts and balance</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(""); setFormSuccess(""); }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showForm ? "Cancel" : "Apply for Account"}
        </button>
      </div>

      {/* ── Application submitted banner ──────────────────────────────────── */}
      {formSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl flex items-start gap-3 text-sm">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {formSuccess}
        </div>
      )}

      {/* ── Apply for account form ────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Apply for Additional Account</h2>
          <p className="text-sm text-slate-500 mb-5">
            Your request will be reviewed by an admin. You'll see the status update below.
          </p>

          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Type
              </label>
              <select
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="CURRENT">Current Account</option>
                <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                <option value="RECURRING_DEPOSIT">Recurring Deposit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="e.g. I need this for business transactions"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={formSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                {formSubmitting ? "Submitting..." : "Submit Application"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Active accounts ───────────────────────────────────────────────── */}
      {accounts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center mb-6">
          <p className="text-slate-500">No account found.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Balance hero */}
              <div className="bg-blue-600 px-8 py-8 text-white text-center">
                <p className="text-sm font-medium text-blue-200 uppercase tracking-wider mb-2">
                  {account.accountType} — Available Balance
                </p>
                <p className="text-5xl font-bold">
                  ₹{account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Details */}
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex justify-between px-6 py-3">
                  <span className="text-slate-500">Account Number</span>
                  <span className="font-mono font-medium text-slate-800">{account.accountNumber}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-slate-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {account.status}
                  </span>
                </div>
                {account.createdAt && (
                  <div className="flex justify-between px-6 py-3">
                    <span className="text-slate-500">Opened On</span>
                    <span className="text-slate-600">
                      {new Date(account.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Account request history ───────────────────────────────────────── */}
      {requests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Applications</h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{req.accountType} Account</p>
                    {req.notes && (
                      <p className="text-slate-500 mt-0.5">{req.notes}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Applied{" "}
                      {req.requestedAt
                        ? new Date(req.requestedAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </p>
                    {req.status === "APPROVED" && req.accountNumber && (
                      <p className="text-xs text-green-700 mt-1 font-medium">
                        Account created: {req.accountNumber}
                      </p>
                    )}
                    {req.status === "REJECTED" && req.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Reason: {req.rejectionReason}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(req.status)}`}>
                    {req.status === "PENDING_APPROVAL" ? "PENDING" : req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default MyAccount;
