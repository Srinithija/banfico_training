import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { hasRole } from "../../auth/roles";

function CreateConsent() {
  const navigate = useNavigate();
  const isMaker = hasRole("MAKER");

  const [formData, setFormData] = useState({
    purpose: "",
    customerId: "",
  });

  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      setError("Failed to load customers");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/consents", formData);
      setSuccess("Consent created successfully!");
      setTimeout(() => {
        navigate("/consents");
      }, 1000);
    } catch (error) {
      console.error("Create Consent Error:", error);
      setError("Failed to create consent.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMaker) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <Link to="/consents" className="text-blue-600 hover:text-blue-800">
            ← Back to Consents
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Access Denied
          </h1>
          <p className="mt-2 text-slate-600">
            Only MAKER users can create consents.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl">
          You do not have permission to create a consent.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/consents"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Consents
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create Consent</h1>
        <p className="mt-1 text-slate-500">Create a new consent request</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-1.5">
              Purpose
            </label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              placeholder="Enter consent purpose"
            />
          </div>

          {/* Customer */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-slate-700 mb-1.5">
              Customer
            </label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Consent"
              )}
            </button>

            <Link
              to="/consents"
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateConsent;
