import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTransaction,
  updateTransaction,
  confirmTransaction,
  type Transaction,
} from "../api/transactions";

import {
  getClients,
  type Client,
} from "../api/clients";

import { useAuth } from "../context/AuthContext";


export default function TransactionDetailsPage() {
  const { transactionId } =
    useParams<{ transactionId: string }>();

  const navigate = useNavigate();

  const {
    activeOrganizationId,
  } = useAuth();


  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingClients, setLoadingClients] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [confirming, setConfirming] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * Edit form state.
   *
   * These values represent what the user is
   * currently editing in the browser.
   */
  const [clientId, setClientId] =
    useState("");

  const [transactionDate, setTransactionDate] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [currency, setCurrency] =
    useState("");

  const [source, setSource] =
    useState("");

  const [sourceTransactionId, setSourceTransactionId] =
    useState("");


  /*
   * Load the transaction.
   */
  async function loadTransaction(
    showLoading = true,
  ) {
    if (
      !activeOrganizationId ||
      !transactionId
    ) {
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await getTransaction(
        activeOrganizationId,
        transactionId,
      );

      setTransaction(data);

      /*
       * Keep the edit form synchronized with
       * the latest server representation.
       */
      setClientId(data.client_id);
      setTransactionDate(
        data.transaction_date,
      );
      setDescription(data.description);
      setAmount(data.amount);
      setCurrency(data.currency);
      setSource(data.source);
      setSourceTransactionId(
        data.source_transaction_id,
      );

      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load transaction.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }


  /*
   * Load available clients for the edit form.
   */
  async function loadClients() {
    if (!activeOrganizationId) {
      setLoadingClients(false);
      return;
    }

    setLoadingClients(true);

    try {
      const response = await getClients(
        activeOrganizationId,
      );

      setClients(response.items);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load clients.",
      );
    } finally {
      setLoadingClients(false);
    }
  }


  /*
   * Initial page load.
   */
  useEffect(() => {
    loadTransaction();
    loadClients();
  }, [
    activeOrganizationId,
    transactionId,
  ]);


  /*
   * Poll while the backend is processing
   * the transaction after an edit.
   */
  useEffect(() => {
    if (
      !transaction ||
      !activeOrganizationId ||
      !transactionId
    ) {
      return;
    }

    const processing =
      transaction.status === "PENDING" ||
      transaction.status === "PROCESSING";

    if (!processing) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        loadTransaction(false);
      }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    transaction,
    activeOrganizationId,
    transactionId,
  ]);


  function startEditing() {
    if (!transaction) {
      return;
    }

    setClientId(transaction.client_id);
    setTransactionDate(
      transaction.transaction_date,
    );
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setCurrency(transaction.currency);
    setSource(transaction.source);
    setSourceTransactionId(
      transaction.source_transaction_id,
    );

    setError("");
    setEditing(true);
  }


  function cancelEditing() {
    if (transaction) {
      setClientId(transaction.client_id);
      setTransactionDate(
        transaction.transaction_date,
      );
      setDescription(transaction.description);
      setAmount(transaction.amount);
      setCurrency(transaction.currency);
      setSource(transaction.source);
      setSourceTransactionId(
        transaction.source_transaction_id,
      );
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
      !transaction
    ) {
      return;
    }

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!description.trim()) {
      setError(
        "Transaction description is required.",
      );
      return;
    }

    if (!amount.trim()) {
      setError(
        "Transaction amount is required.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated =
        await updateTransaction(
          activeOrganizationId,
          transaction.id,
          {
            client_id: clientId,
            transaction_date:
              transactionDate,
            description:
              description.trim(),
            amount: amount.trim(),
            currency:
              currency.trim().toUpperCase(),
            source: source.trim(),
            source_transaction_id:
              sourceTransactionId.trim(),
          },
        );

      /*
       * The backend intentionally returns PENDING
       * after an edit because the old AI result
       * has been invalidated.
       */
      setTransaction(updated);

      setEditing(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update transaction.",
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleConfirm() {
    if (
      !activeOrganizationId ||
      !transaction
    ) {
      return;
    }

    setConfirming(true);
    setError("");

    try {
      const updated =
        await confirmTransaction(
          activeOrganizationId,
          transaction.id,
        );

      setTransaction(updated);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to confirm transaction.",
      );
    } finally {
      setConfirming(false);
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-gray-400">
        Loading transaction...
      </div>
    );
  }


  if (error && !transaction) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 py-16 text-white">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/transactions")
            }
            className="mt-6 text-sm font-semibold text-pink-400 hover:text-pink-300"
          >
            ← Back to transactions
          </button>

        </div>

      </div>
    );
  }


  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 py-16 text-white">

        <div className="mx-auto max-w-3xl">

          <h1 className="text-3xl font-bold">
            Transaction not found
          </h1>

          <Link
            to="/transactions"
            className="mt-6 inline-block text-sm font-semibold text-pink-400 hover:text-pink-300"
          >
            ← Back to transactions
          </Link>

        </div>

      </div>
    );
  }


  const canEdit =
    transaction.status === "PENDING" ||
    transaction.status === "AI_SUGGESTED";

  const processing =
    transaction.status === "PENDING" ||
    transaction.status === "PROCESSING";


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
              Transaction review
            </p>

          </div>


          <Link
            to="/transactions"
            className="text-sm font-semibold text-gray-400 hover:text-white"
          >
            ← Transactions
          </Link>

        </div>

      </header>


      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-12">

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
          Transaction details
        </p>


        <h1 className="mt-3 text-4xl font-black">
          {transaction.description}
        </h1>


        {/* Error while transaction still exists */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* Transaction information */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          <div className="flex items-start justify-between gap-6">

            <div>

              <h2 className="text-xl font-bold">
                Transaction information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Source transaction data
              </p>

            </div>


            {canEdit && !editing && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Edit Transaction
              </button>
            )}

          </div>


          {!editing ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">

              <Detail
                label="Client"
                value={
                  clients.find(
                    (client) =>
                      client.id ===
                      transaction.client_id,
                  )?.name ??
                  transaction.client_id
                }
              />

              <Detail
                label="Transaction date"
                value={
                  transaction.transaction_date
                }
              />

              <Detail
                label="Amount"
                value={`${transaction.currency} ${transaction.amount}`}
              />

              <Detail
                label="Source"
                value={
                  transaction.source ||
                  "Manual"
                }
              />

              <Detail
                label="Source transaction ID"
                value={
                  transaction.source_transaction_id ||
                  "—"
                }
              />

            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Client
                </label>

                <select
                  value={clientId}
                  onChange={(event) =>
                    setClientId(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingClients ||
                    saving
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-pink-500"
                >

                  <option value="">
                    Select a client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                      className="bg-black"
                    >
                      {client.name}
                    </option>
                  ))}

                </select>
              </div>


              <div>
                <label className="mb-2 block text-sm font-medium">
                  Transaction date
                </label>

                <input
                  type="date"
                  value={transactionDate}
                  onChange={(event) =>
                    setTransactionDate(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-pink-500"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <input
                  type="text"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />
              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Amount
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Currency
                  </label>

                  <input
                    type="text"
                    maxLength={3}
                    value={currency}
                    onChange={(event) =>
                      setCurrency(
                        event.target.value.toUpperCase(),
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 uppercase outline-none focus:border-pink-500"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Source
                </label>

                <input
                  type="text"
                  value={source}
                  onChange={(event) =>
                    setSource(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Source transaction ID
                </label>

                <input
                  type="text"
                  value={sourceTransactionId}
                  onChange={(event) =>
                    setSourceTransactionId(
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
                  disabled={
                    saving ||
                    loadingClients
                  }
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


        {/* AI Review */}
        <section className="mt-6 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-red-950/20 via-black to-pink-950/20 p-8">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-400">
            AI review
          </p>


          <h2 className="mt-3 text-2xl font-bold">
            AI categorization
          </h2>


          <div className="mt-6">

            {transaction.ai_category ? (
              <div>

                <p className="text-sm text-gray-500">
                  Suggested category
                </p>

                <p className="mt-2 text-3xl font-black">
                  {transaction.ai_category}
                </p>


                <p className="mt-6 text-sm text-gray-500">
                  Confidence
                </p>

                <p className="mt-2 text-2xl font-bold text-pink-300">
                  {transaction.ai_confidence
                    ? `${(
                        Number(
                          transaction.ai_confidence,
                        ) * 100
                      ).toFixed(1)}%`
                    : "—"}
                </p>

              </div>
            ) : (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-yellow-300">

                {processing
                  ? "AI is processing this transaction. The page will update automatically."
                  : "No AI categorization is currently available."}

              </div>
            )}

          </div>


          {/* Confirmation */}
          <div className="mt-8">

            {transaction.status ===
              "AI_SUGGESTED" && (
              <button
                type="button"
                disabled={confirming}
                onClick={handleConfirm}
                className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-7 py-3 font-bold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirming
                  ? "Confirming..."
                  : "Confirm Category"}
              </button>
            )}


            {transaction.status ===
              "CONFIRMED" && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
                  Confirmed
                </p>

                <p className="mt-2 text-xl font-bold text-green-300">
                  {
                    transaction.confirmed_category
                  }
                </p>

              </div>
            )}


            {(transaction.status ===
              "PENDING" ||
              transaction.status ===
                "PROCESSING") && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-yellow-300">
                AI processing is in progress.
              </div>
            )}

          </div>

        </section>

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
