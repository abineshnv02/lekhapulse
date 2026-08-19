import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getClient,
  updateClient,
  deleteClient,
  type Client,
} from "../api/clients";

import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../auth/permissions";


export default function ClientDetailsPage() {
  const {
    clientId,
  } = useParams<{
    clientId: string;
  }>();

  const navigate = useNavigate();

  const {
    activeOrganizationId,
    hasPermission,
  } = useAuth();


  const [client, setClient] =
    useState<Client | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [error, setError] =
    useState("");


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");


  const canUpdate =
    hasPermission(
      PERMISSIONS.CLIENT_UPDATE,
    );

  const canDelete =
    hasPermission(
      PERMISSIONS.CLIENT_DELETE,
    );


  async function loadClient() {
    if (
      !activeOrganizationId ||
      !clientId
    ) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getClient(
        activeOrganizationId,
        clientId,
      );

      setClient(data);

      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load client.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadClient();
  }, [
    activeOrganizationId,
    clientId,
  ]);


  function startEditing() {
    if (!client) {
      return;
    }

    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);

    setError("");
    setEditing(true);
  }


  function cancelEditing() {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
    }

    setError("");
    setEditing(false);
  }


  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !activeOrganizationId ||
      !clientId ||
      !canUpdate
    ) {
      return;
    }

    if (!name.trim()) {
      setError(
        "Client name is required.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated =
        await updateClient(
          activeOrganizationId,
          clientId,
          {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
        );

      setClient(updated);
      setEditing(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update client.",
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleDelete() {
    if (
      !activeOrganizationId ||
      !clientId ||
      !canDelete
    ) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteClient(
        activeOrganizationId,
        clientId,
      );

      /*
       * Backend performs a soft delete.
       * We return to the client list because
       * this client is no longer part of the
       * active client set.
       */
      navigate("/clients");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete client.",
      );
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-gray-400">
        Loading client...
      </div>
    );
  }


  if (error && !client) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 py-16 text-white">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>

          <Link
            to="/clients"
            className="mt-6 inline-block text-sm font-semibold text-pink-400 hover:text-pink-300"
          >
            ← Back to clients
          </Link>

        </div>

      </div>
    );
  }


  if (!client) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 py-16 text-white">

        <div className="mx-auto max-w-3xl">

          <h1 className="text-3xl font-bold">
            Client not found
          </h1>

          <Link
            to="/clients"
            className="mt-6 inline-block text-sm font-semibold text-pink-400 hover:text-pink-300"
          >
            ← Back to clients
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Header */}
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
              Client management
            </p>

          </div>


          <Link
            to="/clients"
            className="text-sm font-semibold text-gray-400 hover:text-white"
          >
            ← Clients
          </Link>

        </div>

      </header>


      <main className="mx-auto max-w-4xl px-6 py-12">

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
          Client details
        </p>


        <h1 className="mt-3 text-4xl font-black">
          {client.name}
        </h1>


        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}


        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Client information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Contact information for this
                accounting client.
              </p>

            </div>


            {!editing &&
              canUpdate && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Edit Client
                </button>
              )}

          </div>


          {!editing ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">

              <Detail
                label="Name"
                value={client.name}
              />

              <Detail
                label="Email"
                value={
                  client.email || "—"
                }
              />

              <Detail
                label="Phone"
                value={
                  client.phone || "—"
                }
              />

            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />

              </div>


              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>


                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

        </section>


        {canDelete && (
          <section className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              Danger zone
            </p>

            <h2 className="mt-3 text-xl font-bold">
              Remove client
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              This will remove the client from
              the active client list. LekhaPulse
              uses a soft delete so historical
              information can remain preserved.
            </p>


            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(true)
                }
                className="mt-6 rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                Delete Client
              </button>
            ) : (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-5">

                <p className="text-sm text-red-300">
                  Are you sure you want to
                  remove{" "}
                  <strong>
                    {client.name}
                  </strong>
                  ?
                </p>


                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-500 disabled:opacity-50"
                  >
                    {deleting
                      ? "Deleting..."
                      : "Yes, Delete Client"}
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setShowDeleteConfirm(false)
                    }
                    disabled={deleting}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>

                </div>

              </div>
            )}

          </section>
        )}

      </main>

    </div>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-gray-200">
        {value}
      </p>

    </div>
  );
}
