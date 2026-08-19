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
  acceptInvitation,
  getInvitationDetails,
  type InvitationDetails,
} from "../api/team";


export default function AcceptInvitationPage() {
  const {
    token,
  } = useParams<{
    token: string;
  }>();

  const navigate = useNavigate();


  const [invitation, setInvitation] =
    useState<InvitationDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    if (!token) {
      setError(
        "Invalid invitation link.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getInvitationDetails(token)
      .then((data) => {
        setInvitation(data);
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "This invitation is invalid or has expired.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);


  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!token) {
      setError(
        "Invalid invitation link.",
      );
      return;
    }

    if (!password) {
      setError(
        "Password is required.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await acceptInvitation(
        token,
        password,
      );

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to accept invitation.",
      );
    } finally {
      setSubmitting(false);
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-gray-400">
        Loading invitation...
      </div>
    );
  }


  if (success) {
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


            <div className="mt-10 rounded-3xl border border-green-500/20 bg-green-500/[0.05] p-8">

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
                Invitation accepted
              </p>

              <h1 className="mt-4 text-4xl font-black">
                Welcome to LekhaPulse
              </h1>

              <p className="mt-4 leading-7 text-gray-400">
                Your account has been created
                and you have joined{" "}
                <span className="font-semibold text-gray-200">
                  {invitation?.organization_name}
                </span>{" "}
                as an{" "}
                <span className="font-semibold text-gray-200">
                  {invitation?.role}
                </span>
                .
              </p>


              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-5 py-3.5 font-bold transition hover:scale-[1.02]"
              >
                Continue to Login
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }


  if (!invitation) {
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


            <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/[0.05] p-8">

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">
                Invalid invitation
              </p>

              <h1 className="mt-4 text-3xl font-black">
                This invitation cannot be used
              </h1>

              <p className="mt-4 leading-7 text-gray-400">
                {error ||
                  "The invitation is invalid or has expired."}
              </p>


              <Link
                to="/"
                className="mt-8 inline-block w-full rounded-xl border border-white/10 px-5 py-3.5 text-center font-semibold text-gray-300 transition hover:bg-white/10"
              >
                Return Home
              </Link>

            </div>

          </div>

        </div>

      </div>
    );
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
              You're invited
            </p>

            <h1 className="mt-4 text-4xl font-black">
              Join LekhaPulse
            </h1>

            <p className="mt-4 leading-7 text-gray-400">
              You've been invited to join{" "}
              <span className="font-semibold text-gray-200">
                {invitation.organization_name}
              </span>
              .
            </p>


            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Email
                </p>

                <p className="mt-2 font-semibold">
                  {invitation.email}
                </p>
              </div>


              <div className="mt-5">

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Assigned role
                </p>

                <p className="mt-2 inline-flex rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-sm font-semibold text-pink-300">
                  {invitation.role}
                </p>

              </div>

            </div>


            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  required
                  minLength={8}
                  disabled={submitting}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Confirm password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  required
                  minLength={8}
                  disabled={submitting}
                  placeholder="Repeat your password"
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
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-5 py-3.5 font-bold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Creating account..."
                  : "Accept Invitation"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
