import { Link, useLocation } from "react-router-dom";
import keycloak from "../auth/keycloak";
import { hasRole } from "../auth/roles";

function Navbar() {
  const location = useLocation();

  const username = keycloak.tokenParsed?.preferred_username || "User";
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];

  const isCustomer = hasRole("CUSTOMER");

  const isAdmin    = hasRole("ADMIN");

  // ── Customer portal links ─────────────────────────────────────────────────
  const customerLinks = [
    { path: "/portal/my-account",       label: "My Account" },
    { path: "/portal/my-transactions",  label: "Transactions" },
    { path: "/portal/my-beneficiaries", label: "Beneficiaries" },
  ];

  // ── Staff links ───────────────────────────────────────────────────────────
  const staffLinks = [
    { path: "/dashboard",         label: "Dashboard" },
    { path: "/customers",         label: "Customers" },
    { path: "/accounts",          label: "Accounts" },
    { path: "/beneficiaries",     label: "Beneficiaries" },
    { path: "/consents",          label: "Consents" },
    // Account Requests link — only for ADMIN
    ...(isAdmin ? [{ path: "/account-requests", label: "Account Requests" }] : []),
  ];

  const navLinks = isCustomer ? customerLinks : staffLinks;

  // Show only app-defined roles in the badge
  const appRoles = roles.filter((r) =>
    ["ADMIN", "MAKER", "CHECKER", "CUSTOMER"].includes(r)
  );

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard" || location.pathname === "/"
      : location.pathname.startsWith(path);

  const handleLogout = () =>
    keycloak.logout({ redirectUri: window.location.origin });

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo — links to correct home for each role ──────────────────── */}
          <Link
            to={isCustomer ? "/portal/my-account" : "/dashboard"}
            className="flex items-center gap-3"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Mini Banking System</h2>
          </Link>

          {/* ── Navigation links ─────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── User section ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{username}</span>
                <div className="flex gap-1">
                  {appRoles.map((role) => (
                    <span
                      key={role}
                      className={`text-xs font-medium ${
                        role === "CUSTOMER" ? "text-green-300" : "text-blue-300"
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
