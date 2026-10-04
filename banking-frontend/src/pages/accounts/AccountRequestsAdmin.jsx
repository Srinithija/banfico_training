import { useEffect, useState } from "react";
import api from "../../services/api";

function AccountRequestsAdmin() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("pending"); // "pending" | "all"
  const [actionError, setActionError] = useState("");

  const fetchRequests = async () => {
    setLoading(true); setError("");
    try {
      const url = filter === "pending"
        ? "/account-requests/admin/pending"
        : "/account-requests/admin/all";
      const res = await api.get(url);
      setRequests(res.data);
    } catch {
      setError("Failed to load account requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    setActionError("");
    try {
      await api.put(`/account-requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return; // cancelled
    setActionError("");
    try {
      await api.put(`/account-requests/${id}/reject`, { reason: reason || null });
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject request.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":         return "bg-green-100 text-green-800 border border-green-200";
      case "PENDING_APPROVAL": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "REJECTED":         return "bg-red-100 text-red-800 border border-red-200";
      default:                 return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account Applications</h1>
          <p className="mt-1 text-slate-500">Review and approve customer account requests</p>
        </div>

        {/* Filter toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm font-medium">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 transition-colors ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
          {actionError}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-600">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">{error}</div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-500">
            {filter === "pending"
              ? "No pending account applications."
              : "No account applications found."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">

                    <td className="px-6 py-4 text-slate-500">#{req.id}</td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{req.customerName}</p>
                      <p className="text-xs text-slate-400">{req.customerEmail}</p>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">{req.accountType}</td>

                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {req.notes || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {req.requestedAt
                        ? new Date(req.requestedAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                          {req.status === "PENDING_APPROVAL" ? "PENDING" : req.status}
                        </span>
                        {req.status === "APPROVED" && req.accountNumber && (
                          <p className="text-xs text-green-700 mt-1">{req.accountNumber}</p>
                        )}
                        {req.status === "REJECTED" && req.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">{req.rejectionReason}</p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {req.status === "PENDING_APPROVAL" && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status !== "PENDING_APPROVAL" && (
                        <span className="text-xs text-slate-400">
                          {req.reviewedAt
                            ? new Date(req.reviewedAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </span>
                      )}
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

export default AccountRequestsAdmin;
