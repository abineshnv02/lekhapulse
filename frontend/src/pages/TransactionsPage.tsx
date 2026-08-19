import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  confirmTransaction,
  getTransactions,
  type Transaction,
} from "../api/transactions";

import {
  getClients,
  type Client,
} from "../api/clients";

import {
  useAuth,
} from "../context/AuthContext";

import { PERMISSIONS } from "../auth/permissions";

import TransactionForm from "../components/transactions/TransactionForm";
import OrganizationSwitcher from "../components/OrganizationSwitcher";

const PAGE_SIZE = 10;


export default function TransactionsPage() {
  const {
    activeOrganizationId,
    hasPermission,
  } = useAuth();


  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingClients, setLoadingClients] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [confirmingId, setConfirmingId] =
    useState<string | null>(null);


  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [clientId, setClientId] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);


  const canCreate =
    hasPermission(
      PERMISSIONS.TRANSACTION_CREATE,
    );

  const canUpdate =
    hasPermission(
      PERMISSIONS.TRANSACTION_UPDATE,
    );


  async function loadTransactions(
    requestedPage = page,
    showLoading = true,
  ) {
    if (!activeOrganizationId) {
      setTransactions([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const response =
        await getTransactions(
          activeOrganizationId,
          {
            page: requestedPage,
            page_size: PAGE_SIZE,
            search,
            status,
            client_id: clientId || undefined,
          },
        );

      setTransactions(response.items);
      setTotalCount(response.count);
      setTotalPages(
        response.total_pages || 1,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load transactions.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }


  useEffect(() => {
    if (!activeOrganizationId) {
      setClients([]);
      setLoadingClients(false);
      return;
    }

    setLoadingClients(true);

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
        setLoadingClients(false);
      });
  }, [activeOrganizationId]);


  useEffect(() => {
    loadTransactions(page);
  }, [
    activeOrganizationId,
    page,
    search,
    status,
    clientId,
  ]);


  useEffect(() => {
    const processing =
      transactions.some(
        (transaction) =>
          transaction.status === "PENDING" ||
          transaction.status === "PROCESSING",
      );

    if (
      !processing ||
      !activeOrganizationId
    ) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        loadTransactions(
          page,
          false,
        );
      }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    transactions,
    activeOrganizationId,
    page,
    search,
    status,
    clientId,
  ]);


  function handleSearchSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setPage(1);
    setSearch(
      searchInput.trim(),
    );
  }


  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setClientId("");
    setPage(1);
  }


  function handleCreated() {
    setShowCreateForm(false);
    setPage(1);

    loadTransactions(1);
  }


  async function handleConfirm(
    transactionId: string,
  ) {
    if (
      !activeOrganizationId ||
      !canUpdate
    ) {
      return;
    }

    setConfirmingId(transactionId);
    setError("");

    try {
      await confirmTransaction(
        activeOrganizationId,
        transactionId,
      );

      await loadTransactions(
        page,
        false,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to confirm transaction.",
      );
    } finally {
      setConfirmingId(null);
    }
  }


  function statusLabel(
    value: string,
  ): string {
    switch (value) {
      case "PENDING":
        return "Pending";

      case "PROCESSING":
        return "Processing";

      case "AI_SUGGESTED":
        return "AI Suggested";

      case "CONFIRMED":
        return "Confirmed";

      case "FAILED":
        return "Failed";

      default:
        return value;
    }
  }


  function statusClasses(
    value: string,
  ): string {
    switch (value) {
      case "CONFIRMED":
        return "border-green-500/20 bg-green-500/10 text-green-300";

      case "AI_SUGGESTED":
        return "border-pink-500/20 bg-pink-500/10 text-pink-300";

      case "PROCESSING":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

      case "PENDING":
        return "border-blue-500/20 bg-blue-500/10 text-blue-300";

      case "FAILED":
        return "border-red-500/20 bg-red-500/10 text-red-300";

      default:
        return "border-white/5 bg-white/5 text-gray-300";
    }
  }


  function confidenceLabel(
    confidence: string | null,
  ): string {
    if (!confidence) {
      return "—";
    }

    return `${(
      Number(confidence) * 100
    ).toFixed(1)}%`;
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
              Transaction management
            </p>

          </div>


          <div className="flex items-center gap-4">
          <OrganizationSwitcher />

            {canCreate && (
              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(true)
                }
                className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-5 py-3 text-sm font-bold shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
              >
                Add Transaction
              </button>
            )}


            <Link
              to="/dashboard"
              className="hidden text-sm font-semibold text-gray-400 transition hover:text-white sm:block"
            >
              Dashboard
            </Link>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Heading */}
        <section>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
            Transactions
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight">
            Transaction review
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Search, filter, review, and confirm
            client transactions processed by
            LekhaPulse.
          </p>

        </section>


        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-4 lg:grid-cols-[1fr_180px_220px_auto]"
          >

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Search descriptions, categories, clients..."
              className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-pink-500"
            />


            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value,
                );
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-pink-500"
            >

              <option value="">
                All statuses
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="PROCESSING">
                Processing
              </option>

              <option value="AI_SUGGESTED">
                AI Suggested
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="FAILED">
                Failed
              </option>

            </select>


            <select
              value={clientId}
              onChange={(event) => {
                setClientId(
                  event.target.value,
                );
                setPage(1);
              }}
              disabled={loadingClients}
              className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-pink-500 disabled:opacity-50"
            >

              <option value="">
                All clients
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


            <div className="flex gap-3">

              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-gray-200"
              >
                Search
              </button>


              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>

            </div>

          </form>


          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

            <span>
              {loading
                ? "Loading..."
                : `${totalCount} transaction${
                    totalCount === 1
                      ? ""
                      : "s"
                  } found`}
            </span>


            {search && (
              <span>
                Search:{" "}
                <span className="font-medium text-gray-300">
                  {search}
                </span>
              </span>
            )}

          </div>

        </section>


        {/* Create form */}
        {showCreateForm &&
          activeOrganizationId &&
          canCreate && (
            <TransactionForm
              organizationId={
                activeOrganizationId
              }
              onCreated={handleCreated}
              onCancel={() =>
                setShowCreateForm(false)
              }
            />
          )}


        {/* Processing */}
        {transactions.some(
          (transaction) =>
            transaction.status === "PENDING" ||
            transaction.status === "PROCESSING",
        ) && (
          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4 text-sm text-yellow-300">
            AI is processing one or more
            transactions. The list updates
            automatically.
          </div>
        )}


        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}


        {/* Data */}
        <section className="mt-10">

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
              Loading transactions...
            </div>
          )}


          {!loading &&
            !error &&
            transactions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">

                <h2 className="text-2xl font-bold">
                  No transactions found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-gray-400">
                  Try changing your search or
                  filters, or add a new transaction.
                </p>

                {(search ||
                  status ||
                  clientId) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/10"
                  >
                    Clear Filters
                  </button>
                )}

                {!search &&
                  !status &&
                  !clientId &&
                  canCreate && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowCreateForm(true)
                      }
                      className="mt-6 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02]"
                    >
                      Add First Transaction
                    </button>
                  )}

              </div>
            )}


          {!loading &&
            transactions.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/10">

                <div className="hidden grid-cols-7 gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-gray-400 xl:grid">

                  <span>Date</span>
                  <span>Description</span>
                  <span>Amount</span>
                  <span>AI Category</span>
                  <span>Confidence</span>
                  <span>Status</span>
                  <span>
                    {canUpdate
                      ? "Action"
                      : "Status"}
                  </span>

                </div>


                {transactions.map(
                  (transaction) => (
                    <div
                      key={transaction.id}
                      className="border-b border-white/10 px-6 py-6 last:border-b-0 hover:bg-white/[0.02]"
                    >

                      <div className="grid gap-5 xl:grid-cols-7 xl:items-center">

                        <div>
                          <p className="text-xs uppercase text-gray-500 xl:hidden">
                            Date
                          </p>

                          <p className="text-sm text-gray-300">
                            {
                              transaction.transaction_date
                            }
                          </p>
                        </div>


                        <div>
                          <p className="text-xs uppercase text-gray-500 xl:hidden">
                            Description
                          </p>

                          <Link
                            to={`/transactions/${transaction.id}`}
                            className="font-semibold transition hover:text-pink-400"
                          >
                            {
                              transaction.description
                            }
                          </Link>
                        </div>


                        <div>
                          <p className="text-xs uppercase text-gray-500 xl:hidden">
                            Amount
                          </p>

                          <p className="font-semibold">
                            {transaction.currency}{" "}
                            {transaction.amount}
                          </p>
                        </div>


                        <div>
                          <p className="text-xs uppercase text-gray-500 xl:hidden">
                            AI Category
                          </p>

                          <p className="font-medium">
                            {transaction.ai_category ||
                              "Waiting for AI"}
                          </p>

                          {transaction.confirmed_category && (
                            <p className="mt-1 text-xs text-green-400">
                              Confirmed as{" "}
                              {
                                transaction.confirmed_category
                              }
                            </p>
                          )}
                        </div>


                        <div>
                          <p className="text-xs uppercase text-gray-500 xl:hidden">
                            Confidence
                          </p>

                          <p className="text-sm text-gray-300">
                            {confidenceLabel(
                              transaction.ai_confidence,
                            )}
                          </p>
                        </div>


                        <div>
                          <p className="text-xs uppercase text-gray-500 xl:hidden">
                            Status
                          </p>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                              transaction.status,
                            )}`}
                          >
                            {statusLabel(
                              transaction.status,
                            )}
                          </span>
                        </div>


                        <div>

                          {transaction.status ===
                            "AI_SUGGESTED" &&
                            canUpdate && (
                              <button
                                type="button"
                                disabled={
                                  confirmingId ===
                                  transaction.id
                                }
                                onClick={() =>
                                  handleConfirm(
                                    transaction.id,
                                  )
                                }
                                className="rounded-lg bg-gradient-to-r from-red-600 to-pink-500 px-4 py-2 text-sm font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {confirmingId ===
                                transaction.id
                                  ? "Confirming..."
                                  : "Confirm"}
                              </button>
                            )}


                          {transaction.status ===
                            "CONFIRMED" && (
                            <span className="text-sm font-semibold text-green-400">
                              Confirmed
                            </span>
                          )}


                          {(transaction.status ===
                            "PENDING" ||
                            transaction.status ===
                              "PROCESSING") && (
                            <span className="text-sm text-gray-500">
                              AI processing...
                            </span>
                          )}


                          {transaction.status ===
                            "FAILED" && (
                            <span className="text-sm font-semibold text-red-400">
                              Processing failed
                            </span>
                          )}

                        </div>

                      </div>

                    </div>
                  ),
                )}

              </div>
            )}

        </section>


        {/* Pagination */}
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
