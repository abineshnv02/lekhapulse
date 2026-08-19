import { loginUser } from "../api/auth";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveTokens } from "../auth/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();

  async function handleSubmit(
  event: FormEvent,
) {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    const data = await loginUser({
      email,
      password,
    });

    saveTokens(
      data.access_token,
      data.refresh_token,
    );

    await refreshUser();

    navigate("/dashboard");
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Login failed.",
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-12 text-white">

      <div className="mx-auto flex min-h-screen max-w-md items-center">

        <div className="w-full">

          <Link
            to="/"
            className="text-2xl font-extrabold"
          >
            Lekha
            <span className="text-pink-500">
              Pulse
            </span>
          </Link>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
              Welcome back
            </p>

            <h1 className="mt-4 text-4xl font-black">
              Login
            </h1>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

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
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-5 py-3.5 font-bold transition hover:scale-[1.02] disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "Login"}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-gray-400">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-pink-400"
              >
                Register
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
