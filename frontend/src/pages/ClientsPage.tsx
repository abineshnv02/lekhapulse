import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrganizationSwitcher from "../components/OrganizationSwitcher";

import {
  getClients,
  type Client,
} from "../api/clients";

import { useAuth } from "../context/AuthContext";

import { PERMISSIONS } from "../auth/permissions";

import ClientForm from "../components/clients/ClientForm";


export default function ClientsPage() {
  const {
    activeOrganizationId,
    hasPermission,
  } = useAuth();


  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);


  const canCreate =
    hasPermission(
      PERMISSIONS.CLIENT_CREATE,
    );

  const canUpdate =
    hasPermission(
      PERMISSIONS.CLIENT_UPDATE,
    );

  const canDelete =
    hasPermission(
      PERMISSIONS.CLIENT_DELETE,
    );


  useEffect(() => {
    if (!activeOrganizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getClients(activeOrganizationId)
      .then((response) => {
        setClients(response.items);
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load clients.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeOrganizationId]);


  function handleClientCreated(
    client: Client,
  ) {
    setClients((currentClients) => [
      client,
      ...currentClients,
    ]);

    setShowCreateForm(false);
  }


  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <OrganizationSwitcher />
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
              Client management
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


      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Page heading */}
        <section>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
                Clients
              </p>

              <h1 className="mt-3 text-5xl font-black">
                Your clients
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                Manage the clients belonging to your
                accounting organization.
              </p>

            </div>


            {canCreate && (
              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(true)
                }
                className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-bold shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
              >
                Add Client
              </button>
            )}

          </div>

        </section>


        {/* Create form */}
        {showCreateForm &&
          activeOrganizationId &&
          canCreate && (
            <ClientForm
              organizationId={
                activeOrganizationId
              }
              onCreated={
                handleClientCreated
              }
              onCancel={() =>
                setShowCreateForm(false)
              }
            />
          )}


        {/* Data area */}
        <section className="mt-10">

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
              Loading clients...
            </div>
          )}


          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            clients.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">

                <h2 className="text-2xl font-bold">
                  No clients yet
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-gray-400">
                  Add your first accounting client
                  to start managing their
                  transactions.
                </p>


                {canCreate && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateForm(true)
                    }
                    className="mt-6 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02]"
                  >
                    Add Your First Client
                  </button>
                )}

              </div>
            )}


          {!loading &&
            !error &&
            clients.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/10">

                {/* Table header */}
                <div
                  className={`grid border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-gray-400 ${
                    canUpdate || canDelete
                      ? "grid-cols-4"
                      : "grid-cols-3"
                  }`}
                >

                  <span>
                    Name
                  </span>

                  <span>
                    Email
                  </span>

                  <span>
                    Phone
                  </span>

                  {(canUpdate || canDelete) && (
                    <span>
                      Actions
                    </span>
                  )}

                </div>


                {/* Rows */}
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className={`grid border-b border-white/10 px-6 py-5 last:border-b-0 transition hover:bg-white/[0.03] ${
                      canUpdate || canDelete
                        ? "grid-cols-4"
                        : "grid-cols-3"
                    }`}
                  >

                    <Link
                      to={`/clients/${client.id}`}
                      className="font-semibold transition hover:text-pink-400"
                    >
                      {client.name}
                    </Link>

                    <span className="text-gray-400">
                      {client.email || "—"}
                    </span>

                    <span className="text-gray-400">
                      {client.phone || "—"}
                    </span>


                    {(canUpdate || canDelete) && (
                      <div className="flex items-center gap-3">

                        {canUpdate && (
                          <Link
                            to={`/clients/${client.id}`}
                            className="text-sm font-semibold text-pink-400 hover:text-pink-300"
                          >
                            Edit
                          </Link>
                        )}

                        {canDelete && (
                          <span className="text-sm text-gray-600">
                            Delete
                          </span>
                        )}

                      </div>
                    )}

                  </div>
                ))}

              </div>
            )}

        </section>

      </main>

    </div>
  );
}
