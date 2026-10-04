import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function CreateBeneficiary() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    email: "",
    phone: "",
    customerId: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null); // holds the created beneficiary on success

  useEffect(() => {
    api
      .get("/customers")
      .then((response) => setCustomers(response.data))
      .catch(() => setError("Failed to load customers"));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const requestData = {
        name: formData.name,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        email: formData.email,
        phone: formData.phone,
        customerId: Number(formData.customerId),
      };

      const response = await api.post("/beneficiaries", requestData);
      setSuccessData(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors?.length) {
        setError(error.response.data.errors.join(", "));
      } else {
        setError("Failed to create beneficiary");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/beneficiaries"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Beneficiaries
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Add Beneficiary</h1>
        <p className="mt-1 text-slate-500">Add a new beneficiary for fund transfers</p>
      </div>

      {/* ── Success screen — shown after creation ─────────────────────────── */}
      {successData ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          {/* Green check icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
            Beneficiary created successfully
          </h2>
          <p className="text-slate-500 text-center text-sm mb-6">
            The request has been submitted and is awaiting Checker approval.
          </p>

          {/* Status pill */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status: PENDING
            </span>
          </div>

          {/* Summary card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 mb-7 text-sm">
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-500">Beneficiary ID</span>
              <span className="font-medium text-slate-800">#{successData.id}</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-800">{successData.name}</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-500">Account Number</span>
              <span className="font-medium text-slate-800">{successData.accountNumber}</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-500">Bank</span>
              <span className="font-medium text-slate-800">{successData.bankName}</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-500">IFSC</span>
              <span className="font-mono font-medium text-slate-800">{successData.ifscCode}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/beneficiaries")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-center"
            >
              View All Beneficiaries
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setFormData({
                  name: "",
                  accountNumber: "",
                  bankName: "",
                  ifscCode: "",
                  email: "",
                  phone: "",
                  customerId: "",
                });
              }}
              className="flex-1 border border-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-center"
            >
              Add Another Beneficiary
            </button>
          </div>
        </div>
      ) : (
        /* ── Create form ──────────────────────────────────────────────────── */
        <>
          {/* Error Alert */}
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  placeholder="Enter full name"
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  placeholder="Enter account number"
                />
              </div>

              {/* Bank Name + IFSC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    placeholder="e.g. HDFC Bank"
                  />
                </div>

                <div>
                  <label htmlFor="ifscCode" className="block text-sm font-medium text-slate-700 mb-1.5">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    id="ifscCode"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow uppercase"
                    placeholder="e.g. HDFC0001234"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              {/* Customer Dropdown */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Linked Customer
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} (ID: {customer.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3">
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
                    "Create Beneficiary"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/beneficiaries")}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default CreateBeneficiary;