import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getAuditEvents,
  type AuditEvent,
} from "../api/audit";

import {
  useAuth,
} from "../context/AuthContext";

import {
  PERMISSIONS,
} from "../auth/permissions";


const PAGE_SIZE = 10;


export default function AuditPage() {
  const {
    activeOrganizationId,
    hasPermission,
  } = useAuth();


  const [events, setEvents] =
    useState<AuditEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [expandedEventId, setExpandedEventId] =
    useState<string | null>(null);


  const canViewAudit =
    hasPermission(
      PERMISSIONS.AUDIT_VIEW,
    );


  useEffect(() => {
    if (
      !activeOrganizationId ||
      !canViewAudit
    ) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getAuditEvents(
      activeOrganizationId,
      page,
      PAGE_SIZE,
    )
      .then((response) => {
        setEvents(response.items);
        setTotalCount(response.count);
        setTotalPages(
          response.total_pages || 1,
        );
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load audit events.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    activeOrganizationId,
    canViewAudit,
    page,
  ]);


  function formatDate(
    value: string,
  ): string {
    return new Date(value).toLocaleString();
  }


  function actionLabel(
    action: string,
  ): string {
    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  }


  function actionClasses(
    action: string,
  ): string {
    if (
      action.includes("DELETED") ||
      action.includes("REMOVED")
    ) {
      return "border-red-500/20 bg-red-500/10 text-red-300";
    }

    if (
      action.includes("CONFIRMED") ||
      action.includes("ACCEPTED")
    ) {
      return "border-green-500/20 bg-green-500/10 text-green-300";
    }

    if (
      action.includes("CREATED") ||
      action.includes("INVITED")
    ) {
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }

    return "border-pink-500/20 bg-pink-500/10 text-pink-300";
  }


  function formatMetadataValue(
    value: unknown,
  ): string {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    return JSON.stringify(
      value,
      null,
      2,
    );
  }


  if (!canViewAudit) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">

        <header className="border-b border-white/10 bg-black/70 backdrop-blur-xl">

          <div className="mx-auto max-w-7xl px-6 py-5">

            <Link
              to="/dashboard"
              className="text-2xl font-extrabold"
            >
              Lekha
              <span className="text-pink-500">
                Pulse
              </span>
            </Link>

          </div>

        </header>


        <main className="mx-auto max-w-3xl px-6 py-16">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">

            <h1 className="text-2xl font-bold">
              Access restricted
            </h1>

            <p className="mt-3 text-gray-400">
              You do not have permission to
              view audit events.
            </p>

          </div>

        </main>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#050505] text-white">

      <header className="border-b border-white/10 bg-black/70 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <Link
              to="/dashboard"
              className="text-2xl font-extrabold"
            >
              Lekha
              <span className="text-pink-500">
                Pulse
              </span>
            </Link>

            <p className="mt-1 text-sm text-gray-500">
              Audit trail
            </p>

          </div>


          <Link
            to="/dashboard"
            className="text-sm font-semibold text-gray-400 transition hover:text-white"
          >
            ← Dashboard
          </Link>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-6 py-12">

        <section>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
            Audit
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight">
            Activity history
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Review important actions performed
            inside your accounting organization.
          </p>

        </section>


        <section className="mt-8">

          <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

            <span>
              {loading
                ? "Loading..."
                : `${totalCount} audit event${
                    totalCount === 1
                      ? ""
                      : "s"
                  }`}
            </span>

            <span>
              Page{" "}
              <span className="font-semibold text-white">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {totalPages}
              </span>
            </span>

          </div>

        </section>


        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}


        <section className="mt-8">

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
              Loading audit history...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">

              <h2 className="text-2xl font-bold">
                No audit events yet
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-gray-400">
                Important organization activity
                will appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">

              <div className="hidden grid-cols-[180px_1fr_220px_140px] gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-gray-400 lg:grid">

                <span>
                  Time
                </span>

                <span>
                  Action
                </span>

                <span>
                  Actor
                </span>

                <span>
                  Target
                </span>

              </div>


              {events.map(
                (event) => {

                  const expanded =
                    expandedEventId ===
                    event.id;

                  return (
                    <div
                      key={event.id}
                      className="border-b border-white/10 last:border-b-0"
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEventId(
                            expanded
                              ? null
                              : event.id,
                          )
                        }
                        className="w-full text-left transition hover:bg-white/[0.03]"
                      >

                        <div className="grid gap-4 px-6 py-5 lg:grid-cols-[180px_1fr_220px_140px] lg:items-center">

                          <div>

                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 lg:hidden">
                              Time
                            </p>

                            <p className="text-sm text-gray-300">
                              {formatDate(
                                event.created_at,
                              )}
                            </p>

                          </div>


                          <div>

                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 lg:hidden">
                              Action
                            </p>

                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${actionClasses(
                                event.action,
                              )}`}
                            >
                              {actionLabel(
                                event.action,
                              )}
                            </span>

                          </div>


                          <div>

                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 lg:hidden">
                              Actor
                            </p>

                            <p className="font-medium text-gray-200">
                              {event.actor_email ??
                                "System"}
                            </p>

                          </div>


                          <div>

                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 lg:hidden">
                              Target
                            </p>

                            <p className="text-sm text-gray-400">
                              {event.target_type}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-600">
                              {event.target_id}
                            </p>

                          </div>

                        </div>

                      </button>


                      {expanded && (
                        <div className="border-t border-white/10 bg-black/30 px-6 py-6">

                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Event details
                          </p>


                          <div className="mt-4 grid gap-4 md:grid-cols-2">

                            <div>

                              <p className="text-xs text-gray-500">
                                Actor
                              </p>

                              <p className="mt-1 text-sm text-gray-200">
                                {event.actor_email ??
                                  "System"}
                              </p>

                            </div>


                            <div>

                              <p className="text-xs text-gray-500">
                                Target
                              </p>

                              <p className="mt-1 text-sm text-gray-200">
                                {event.target_type}
                              </p>

                            </div>


                            <div className="md:col-span-2">

                              <p className="text-xs text-gray-500">
                                Target ID
                              </p>

                              <p className="mt-1 break-all font-mono text-xs text-gray-400">
                                {event.target_id}
                              </p>

                            </div>

                          </div>


                          <div className="mt-6">

                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                              Metadata
                            </p>


                            <div className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4">

                              {Object.entries(
                                event.metadata,
                              ).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="grid gap-2 border-b border-white/5 py-3 last:border-b-0 md:grid-cols-[220px_1fr]"
                                  >

                                    <span className="text-sm font-semibold text-gray-300">
                                      {key}
                                    </span>

                                    <pre className="whitespace-pre-wrap break-words text-xs leading-6 text-gray-500">
                                      {formatMetadataValue(
                                        value,
                                      )}
                                    </pre>

                                  </div>
                                ),
                              )}

                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                },
              )}

            </div>
          )}

        </section>


        {!loading &&
          totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>


              <div className="text-sm text-gray-500">
                Page{" "}
                <span className="font-semibold text-white">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {totalPages}
                </span>
              </div>


              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

            </div>
          )}

      </main>

    </div>
  );
}
