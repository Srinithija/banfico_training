import { useEffect, useState } from "react";
import api from "../../services/api";

function MyBeneficiaries() {
  const [beneficiaries, setBeneficiaries]   = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  // ── Expanded beneficiary row ──────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState(null);

  // ── Add beneficiary form ──────────────────────────────────────────────────
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({
    name: "", accountNumber: "", bankName: "",
    ifscCode: "", email: "", phone: "",
  });
  const [formError, setFormError]       = useState("");
  const [formSuccess, setFormSuccess]   = useState("");
  const [submitting, setSubmitting]     = useState(false);

  // ── Transfer modal ────────────────────────────────────────────────────────
  const [transferTarget, setTransferTarget]     = useState(null);
  const [transferAmount, setTransferAmount]     = useState("");
  const [transferError, setTransferError]       = useState("");
  const [transferSuccess, setTransferSuccess]   = useState("");
  const [transferring, setTransferring]         = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const [bRes, txRes] = await Promise.all([
        api.get("/customer/my-beneficiaries"),
        api.get("/customer/my-transactions"),
      ]);
      setBeneficiaries(bRes.data);
      setAllTransactions(txRes.data);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filter transactions for a specific beneficiary ────────────────────────
  // Transactions to a beneficiary are stored as "TRANSFER TO <NAME>"
  const txForBeneficiary = (beneficiaryName) =>
    allTransactions.filter((tx) =>
      tx.transactionType
        ?.toUpperCase()
        .includes(beneficiaryName.toUpperCase())
    );

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  // ── Add beneficiary ───────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess(""); setSubmitting(true);
    try {
      await api.post("/customer/my-beneficiaries", form);
      setFormSuccess(`Beneficiary "${form.name}" added successfully.`);
      setForm({ name: "", accountNumber: "", bankName: "", ifscCode: "", email: "", phone: "" });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length)  setFormError(data.errors.join(" | "));
      else if (data?.message)    setFormError(data.message);
      else                       setFormError("Failed to add beneficiary.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete beneficiary ────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from your beneficiaries?`)) return;
    try {
      await api.delete(`/customer/my-beneficiaries/${id}`);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove beneficiary.");
    }
  };

  // ── Transfer ──────────────────────────────────────────────────────────────
  const openTransfer = (e, beneficiary) => {
    e.stopPropagation(); // prevent row expand/collapse
    setTransferTarget(beneficiary);
    setTransferAmount("");
    setTransferError("");
    setTransferSuccess("");
  };

  const closeTransfer = () => {
    setTransferTarget(null);
    setTransferAmount("");
    setTransferError("");
    setTransferSuccess("");
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError(""); setTransferSuccess(""); setTransferring(true);
    try {
      await api.post(`/customer/my-beneficiaries/${transferTarget.id}/transfer`, {
        amount: parseFloat(transferAmount),
      });
      setTransferSuccess(
        `₹${parseFloat(transferAmount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })} transferred to ${transferTarget.name} successfully.`
      );
      setTransferAmount("");
      fetchAll(); // refresh both beneficiaries and transactions
    } catch (err) {
      setTransferError(
        err.response?.data?.message || "Transfer failed. Please try again."
      );
    } finally {
      setTransferring(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Beneficiaries</h1>
          <p className="mt-1 text-slate-500">
            Click a row to view transfer history · Pay to send money instantly
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(""); setFormSuccess(""); }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showForm ? "Cancel" : "Add Beneficiary"}
        </button>
      </div>

      {/* ── Add success banner ────────────────────────────────────────────── */}
      {formSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl flex items-center gap-3 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {formSuccess}
        </div>
      )}

      {/* ── Add beneficiary form ──────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">New Beneficiary</h2>
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "name",          label: "Beneficiary Name",  placeholder: "Full name" },
                { name: "accountNumber", label: "Account Number",    placeholder: "Account number" },
                { name: "bankName",      label: "Bank Name",         placeholder: "e.g. HDFC Bank" },
                { name: "ifscCode",      label: "IFSC Code",         placeholder: "e.g. HDFC0001234", extra: "uppercase" },
                { name: "email",         label: "Email",             placeholder: "email@example.com", type: "email" },
                { name: "phone",         label: "Phone",             placeholder: "10-digit number", maxLength: 10 },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    name={f.name} value={form[f.name]} onChange={handleChange}
                    type={f.type || "text"} required={f.name !== "phone"}
                    maxLength={f.maxLength}
                    className={`w-full px-4 py-2.5 border border-slate-300 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                      ${f.extra || ""}`}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                {submitting ? "Adding..." : "Add Beneficiary"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Beneficiary list ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-slate-500 py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      ) : beneficiaries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-500">No beneficiaries yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {beneficiaries.map((b, idx) => {
            const isExpanded = expandedId === b.id;
            const txHistory  = txForBeneficiary(b.name);
            const isLast     = idx === beneficiaries.length - 1;

            return (
              <div key={b.id} className={!isLast ? "border-b border-slate-200" : ""}>

                {/* ── Beneficiary row ────────────────────────────────────── */}
                <div
                  onClick={() => toggleExpand(b.id)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  {/* Left: name + bank info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-sm">
                        {b.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{b.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {b.bankName} · {b.accountNumber} · {b.ifscCode}
                      </p>
                    </div>
                  </div>

                  {/* Right: status + tx count + actions */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {/* Transaction count badge */}
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {txHistory.length} txn{txHistory.length !== 1 ? "s" : ""}
                    </span>

                    {/* Status badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      b.status === "APPROVED"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : b.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                      {b.status}
                    </span>

                    {/* Pay button */}
                    {b.status === "APPROVED" && (
                      <button
                        onClick={(e) => openTransfer(e, b)}
                        className="inline-flex items-center gap-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pay
                      </button>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(b.id, b.name); }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>

                    {/* Expand chevron */}
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* ── Expanded: transaction history ──────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Transaction History — {b.name}
                    </h3>

                    {txHistory.length === 0 ? (
                      <p className="text-sm text-slate-400 py-2">
                        No transfers to this beneficiary yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {txHistory.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              {/* Arrow icon */}
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {tx.transactionDate
                                    ? new Date(tx.transactionDate).toLocaleString("en-IN", {
                                        day: "2-digit", month: "short", year: "numeric",
                                        hour: "2-digit", minute: "2-digit",
                                      })
                                    : "—"}
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              {tx.status}
                            </span>
                          </div>
                        ))}

                        {/* Total transferred */}
                        <div className="flex justify-between items-center pt-2 px-1 text-sm font-medium text-slate-700">
                          <span>Total transferred</span>
                          <span>
                            ₹{txHistory
                              .reduce((sum, tx) => sum + tx.amount, 0)
                              .toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ── Transfer modal ────────────────────────────────────────────────── */}
      {transferTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Transfer Money</h2>
              <button onClick={closeTransfer} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Beneficiary details — read-only */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-2 text-sm">
              {[
                ["To",      transferTarget.name],
                ["Account", transferTarget.accountNumber],
                ["Bank",    transferTarget.bankName],
                ["IFSC",    transferTarget.ifscCode],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleTransfer} className="px-6 py-5 space-y-4">

              {transferSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {transferSuccess}
                </div>
              )}

              {transferError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {transferError}
                </div>
              )}

              {!transferSuccess && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Amount (₹)
                    </label>
                    <input
                      type="number" min="1" step="0.01" required
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                      placeholder="Enter amount"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={transferring}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl transition-colors">
                      {transferring ? "Transferring..." : "Confirm Transfer"}
                    </button>
                    <button type="button" onClick={closeTransfer}
                      className="flex-1 border border-slate-300 text-slate-700 font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {transferSuccess && (
                <button type="button" onClick={closeTransfer}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition-colors">
                  Close
                </button>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyBeneficiaries;
