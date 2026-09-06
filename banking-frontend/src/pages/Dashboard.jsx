import { Link } from "react-router-dom";
import keycloak from "../auth/keycloak";
import { hasRole } from "../auth/roles";
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
  const cards = [
    {
      title: "Customers",
      description: "View and manage all customers",
      path: "/customers",
      color: "bg-blue-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Accounts",
      description: "Manage bank accounts",
      path: "/accounts",
      color: "bg-indigo-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      title: "Beneficiaries",
      description: "Add and manage beneficiaries",
      path: "/beneficiaries",
      color: "bg-emerald-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Banking Dashboard</h1>
<p className="mt-2 text-slate-600">
  Welcome, <span className="font-semibold">{username}</span>
</p>

<p className="mt-1 text-sm text-slate-500">
  Role: <span className="font-semibold">{role}</span>
</p>
      </div>
    {/* Role Information */}
<div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

  {isAdmin && (
    <>
      <h2 className="text-lg font-semibold text-slate-900">
        Administrator Access
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        You can manage bank accounts and perform administrative operations.
      </p>
    </>
  )}

  {isMaker && (
    <>
      <h2 className="text-lg font-semibold text-slate-900">
        Maker Access
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        You can create banking transactions.
      </p>
    </>
  )}

  {isChecker && (
    <>
      <h2 className="text-lg font-semibold text-slate-900">
        Checker Access
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        You can perform checking and beneficiary operations.
      </p>
    </>
  )}

</div>
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.path}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
          >
            <div className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{card.title}</h3>
            <p className="text-sm text-slate-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;