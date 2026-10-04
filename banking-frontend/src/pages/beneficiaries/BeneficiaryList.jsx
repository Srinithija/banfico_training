import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { hasRole } from "../../auth/roles";

function BeneficiaryList() {
  const navigate = useNavigate();
  const isMaker = hasRole("MAKER");
  const isChecker = hasRole("CHECKER");
  const canDelete = hasRole("ADMIN") || hasRole("CHECKER");

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Status badge styling ──────────────────────────────────────────────────
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "APPROVED":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200";
      case "REJECTED":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200";
      default:
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  // ── Checker actions ───────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await api.put(`/beneficiaries/${id}/approve`);
      fetchBeneficiaries();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to approve beneficiary";
      alert(msg);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/beneficiaries/${id}/reject`);
      fetchBeneficiaries();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reject beneficiary";
      alert(msg);
    }
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchBeneficiaries = async () => {
    try {
      const response = await api.get("/beneficiaries");
      setBeneficiaries(response.data);
    } catch (err) {
      console.error("Beneficiary API Error:", err);
      setError("Failed to load beneficiaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // ── Delete (existing, unchanged) ──────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this beneficiary?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/beneficiaries/${id}`);
      setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
    } catch (err) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to delete beneficiary");
      }
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-600">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-lg">Loading beneficiaries...</span>
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
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Beneficiaries</h1>
          <p className="mt-1 text-slate-500">Manage saved beneficiaries for transfers</p>
        </div>

        {isMaker && (
          <button
            onClick={() => navigate("/beneficiaries/create")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Beneficiary
          </button>
        )}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {beneficiaries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No beneficiaries found</h3>
          <p className="text-slate-500 mb-6">Add your first beneficiary to get started.</p>
          {isMaker && (
            <button
              onClick={() => navigate("/beneficiaries/create")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Add Beneficiary
            </button>
          )}
        </div>
      ) : (
        /* ── Table ─────────────────────────────────────────────────────────── */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IFSC</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="hover:bg-slate-50 transition-colors">

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      #{beneficiary.id}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {beneficiary.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {beneficiary.accountNumber}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {beneficiary.bankName}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">
                      {beneficiary.ifscCode}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {beneficiary.customerName}
                    </td>

                    {/* ── Status badge ─────────────────────────────────────── */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(beneficiary.status)}>
                        {beneficiary.status ?? "UNKNOWN"}
                      </span>
                    </td>

                    {/* ── Actions ──────────────────────────────────────────── */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 justify-end">

                        {/* Checker: Approve / Reject — only for PENDING */}
                        {isChecker && beneficiary.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(beneficiary.id)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>

                            <span className="text-slate-300 select-none">|</span>

                            <button
                              onClick={() => handleReject(beneficiary.id)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        {/* Delete — ADMIN or CHECKER */}
                        {canDelete && (
                          <>
                            {isChecker && beneficiary.status === "PENDING" && (
                              <span className="text-slate-300 select-none">|</span>
                            )}
                            <button
                              onClick={() => handleDelete(beneficiary.id)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}

                        {/* Maker: no action buttons in this column */}
                        {!isChecker && !canDelete && (
                          <span className="text-xs text-slate-400">—</span>
                        )}

                      </div>
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

export default BeneficiaryList;
