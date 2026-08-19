import { type FormEvent, useEffect, useState } from "react";

import {
  createTransaction,
  type Transaction,
} from "../../api/transactions";

import {
  getClients,
  type Client,
} from "../../api/clients";


interface TransactionFormProps {
  organizationId: string;
  onCreated: (transaction: Transaction) => void;
  onCancel: () => void;
}


export default function TransactionForm({
  organizationId,
  onCreated,
  onCancel,
}: TransactionFormProps) {
  const [clients, setClients] =
    useState<Client[]>([]);

  const [clientId, setClientId] =
    useState("");

  const [transactionDate, setTransactionDate] =
    useState(
      new Date().toISOString().slice(0, 10),
    );

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [currency, setCurrency] =
    useState("INR");

  const [sourceTransactionId, setSourceTransactionId] =
    useState("");

  const [loadingClients, setLoadingClients] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    getClients(organizationId)
      .then((response) => {
        setClients(response.items);

        if (response.items.length > 0) {
          setClientId(response.items[0].id);
        }
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
  }, [organizationId]);


  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!description.trim()) {
      setError("Transaction description is required.");
      return;
    }

    if (!amount.trim()) {
      setError("Transaction amount is required.");
      return;
    }

    setLoading(true);

    try {
      const transaction =
        await createTransaction(
          organizationId,
          {
            client_id: clientId,
            transaction_date:
              transactionDate,
            description:
              description.trim(),
            amount: amount.trim(),
            currency:
              currency.trim().toUpperCase(),
            source: "manual",
            source_transaction_id:
              sourceTransactionId.trim(),
          },
        );

      onCreated(transaction);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create transaction.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <h2 className="text-xl font-bold">
        Add transaction
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Add a transaction and let LekhaPulse
        process it asynchronously.
      </p>


      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >

        {/* Client */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Client
          </label>

          {loadingClients ? (
            <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-gray-500">
              Loading clients...
            </div>
          ) : (
            <select
              value={clientId}
              onChange={(event) =>
                setClientId(event.target.value)
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
          )}
        </div>


        {/* Date */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Transaction date
          </label>

          <input
            type="date"
            value={transactionDate}
            onChange={(event) =>
              setTransactionDate(event.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-pink-500"
          />
        </div>


        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <input
            type="text"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="AWS monthly cloud hosting"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
          />
        </div>


        {/* Amount + Currency */}
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
                setAmount(event.target.value)
              }
              placeholder="15000.00"
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
              placeholder="INR"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 uppercase outline-none focus:border-pink-500"
            />
          </div>

        </div>


        {/* Optional source transaction ID */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Source transaction ID
            <span className="ml-2 text-xs text-gray-500">
              Optional
            </span>
          </label>

          <input
            type="text"
            value={sourceTransactionId}
            onChange={(event) =>
              setSourceTransactionId(
                event.target.value,
              )
            }
            placeholder="BANK-000123"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
          />
        </div>


        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        <div className="flex flex-col gap-3 sm:flex-row">

          <button
            type="submit"
            disabled={
              loading || loadingClients
            }
            className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Transaction"}
          </button>


          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}
