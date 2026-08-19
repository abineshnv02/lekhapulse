import { useState } from "react";
import type { FormEvent } from "react";


import {
  createClient,
  type Client,
} from "../../api/clients";


interface ClientFormProps {
  organizationId: string;
  onCreated: (client: Client) => void;
  onCancel: () => void;
}


export default function ClientForm({
  organizationId,
  onCreated,
  onCancel,
}: ClientFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }

    setLoading(true);

    try {
      const client = await createClient(
        organizationId,
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      );

      onCreated(client);

      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create client.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <h2 className="text-xl font-bold">
        Add client
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Enter the basic details for the accounting
        client.
      </p>


      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >

        <div>
          <label className="mb-2 block text-sm font-medium">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="ABC Private Limited"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-pink-500"
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
              setEmail(event.target.value)
            }
            placeholder="accounts@abc.com"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-pink-500"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-pink-500"
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
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Client"}
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
