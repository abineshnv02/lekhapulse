import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import OrganizationSwitcher from "../components/OrganizationSwitcher";

import {
  getDashboardSummary,
  type DashboardSummary,
} from "../api/dashboard";

import { PERMISSIONS } from "../auth/permissions";

export default function DashboardPage() {
  const navigate = useNavigate();

  const {
    user,
    activeOrganizationId,
    logout,
    hasPermission,
  } = useAuth();


  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loadingSummary, setLoadingSummary] =
    useState(true);

  const [summaryError, setSummaryError] =
    useState("");

 const canViewMembers =
  hasPermission(
    PERMISSIONS.MEMBER_VIEW,
  );

const canViewAudit =
  hasPermission(
    PERMISSIONS.AUDIT_VIEW,
  );

  const activeMembership =
    user?.memberships.find(
      (membership) =>
        membership.organization_id ===
        activeOrganizationId,
    ) ??
    user?.memberships[0];


  useEffect(() => {
    if (!activeOrganizationId) {
      setSummary(null);
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);
    setSummaryError("");

    getDashboardSummary(
      activeOrganizationId,
    )
      .then((data) => {
        setSummary(data);
      })
      .catch((error) => {
        setSummaryError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard metrics.",
        );
      })
      .finally(() => {
        setLoadingSummary(false);
      });
  }, [activeOrganizationId]);


  function handleLogout() {
    logout();
    navigate("/");
  }


  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Navigation */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            to="/dashboard"
            className="text-2xl font-extrabold tracking-tight"
          >
            Lekha
            <span className="text-pink-500">
              Pulse
            </span>
          </Link>


          <div className="flex items-center gap-5">
	     <OrganizationSwitcher />

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-white">
                {user?.email}
              </p>

              {activeMembership && (
                <p className="mt-1 text-xs text-gray-500">
                  {activeMembership.organization_name}
                  {" • "}
                  {activeMembership.role}
                </p>
              )}

            </div>


            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Heading */}
        <section>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
            Dashboard
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Welcome back
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-400">
            Manage your accounting clients,
            review transaction activity, and
            work through AI-generated
            categorization suggestions.
          </p>

        </section>


        {/* Organization */}
        <section className="mt-10">

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-950/30 via-white/[0.03] to-pink-950/20 p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Active organization
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {activeMembership?.organization_name ??
                    "No organization"}
                </h2>

              </div>


              <div className="rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-300">
                {activeMembership?.role ??
                  "No role"}
              </div>

            </div>

          </div>

        </section>


        {/* Metrics */}
        <section className="mt-10">

          {summaryError && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
              {summaryError}
            </div>
          )}


          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <MetricCard
              title="Clients"
              value={
                loadingSummary
                  ? "—"
                  : summary?.client_count ?? 0
              }
              description="Active clients"
            />


            <MetricCard
              title="Transactions"
              value={
                loadingSummary
                  ? "—"
                  : summary?.transaction_count ?? 0
              }
              description="Total transactions"
            />


            <MetricCard
              title="Awaiting Review"
              value={
                loadingSummary
                  ? "—"
                  : summary?.ai_suggested_count ?? 0
              }
              description="AI suggestions awaiting confirmation"
              emphasis
            />


            <MetricCard
              title="Confirmed"
              value={
                loadingSummary
                  ? "—"
                  : summary?.confirmed_count ?? 0
              }
              description="Confirmed classifications"
            />

          </div>

        </section>


        {/* Secondary status metrics */}
        <section className="mt-5">

          <div className="grid gap-5 sm:grid-cols-3">

            <StatusCard
              title="Pending"
              value={
                loadingSummary
                  ? "—"
                  : summary?.pending_count ?? 0
              }
            />


            <StatusCard
              title="Processing"
              value={
                loadingSummary
                  ? "—"
                  : summary?.processing_count ?? 0
              }
            />


            <StatusCard
              title="Failed"
              value={
                loadingSummary
                  ? "—"
                  : summary?.failed_count ?? 0
              }
            />

          </div>

        </section>


        {/* Application Areas */}
        <section className="mt-10">

          <div className="grid gap-6 md:grid-cols-3">

            {canViewMembers && (
             <DashboardCard
             title="Team"
             description="Manage organization members and invite accountants, admins, and viewers."
             href="/team"
             action="Manage Team"
             />
            )}

             {canViewAudit && (
             <DashboardCard
             title="Audit Log"
             description="Review important organization activity and business changes."
             href="/audit"
             action="View Audit Log"
             />
             )}

            <DashboardCard
              title="Clients"
              description="Manage your accounting clients and their contact information."
              href="/clients"
              action="Open Clients"
            />


            <DashboardCard
              title="Transactions"
              description="Review client transactions and AI-generated classifications."
              href="/transactions"
              action="Open Transactions"
            />


            <DashboardCard
              title="AI Categorization"
              description="Review AI suggestions and confirm final accounting classifications."
              href="/transactions"
              action="Review AI"
            />

          </div>

        </section>


        {/* Workflow */}
        <section className="mt-10">

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-400">
              LekhaPulse workflow
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              From transaction to confirmed category
            </h2>


            <div className="mt-8 grid gap-6 md:grid-cols-4">

              <WorkflowStep
                number="01"
                title="Add"
                description="Create or import a client transaction."
              />

              <WorkflowStep
                number="02"
                title="Analyze"
                description="Celery sends the transaction through the AI categorization workflow."
              />

              <WorkflowStep
                number="03"
                title="Review"
                description="Review the suggested category and confidence."
              />

              <WorkflowStep
                number="04"
                title="Confirm"
                description="Approve the final accounting classification."
              />

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


function MetricCard({
  title,
  value,
  description,
  emphasis = false,
}: {
  title: string;
  value: number | string;
  description: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        emphasis
          ? "border-pink-500/20 bg-pink-500/[0.06]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >

      <p className="text-sm font-semibold text-gray-400">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>

    </div>
  );
}


function StatusCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5">

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


function DashboardCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      to={href}
      className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition duration-200 hover:-translate-y-1 hover:border-pink-500/30 hover:bg-white/[0.05]"
    >

      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-gray-400">
        {description}
      </p>

      <p className="mt-8 text-sm font-semibold text-pink-400 transition group-hover:text-pink-300">
        {action} →
      </p>

    </Link>
  );
}


function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <div className="text-4xl font-black text-white/10">
        {number}
      </div>

      <h3 className="mt-3 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        {description}
      </p>

    </div>
  );
}
