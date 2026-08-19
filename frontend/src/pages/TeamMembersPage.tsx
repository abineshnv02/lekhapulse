import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  type TeamMember,
} from "../api/team";

import { useAuth } from "../context/AuthContext";

import { PERMISSIONS } from "../auth/permissions";


export default function TeamMembersPage() {
  const {
    activeOrganizationId,
    hasPermission,
  } = useAuth();


  const [members, setMembers] =
    useState<TeamMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showInviteForm, setShowInviteForm] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [role, setRole] = useState<
    "ADMIN" | "ACCOUNTANT" | "VIEWER"
  >("ACCOUNTANT");

  const [inviting, setInviting] =
    useState(false);

  const [invitationUrl, setInvitationUrl] =
    useState("");


  /*
   * Role-management state.
   */
  const [editingMembershipId, setEditingMembershipId] =
    useState<string | null>(null);

  const [editingRole, setEditingRole] =
    useState<
      "ADMIN" | "ACCOUNTANT" | "VIEWER"
    >("ACCOUNTANT");

  const [savingRole, setSavingRole] =
    useState(false);

  const [removingMembershipId, setRemovingMembershipId] =
    useState<string | null>(null);

  const [confirmingRemoveMembershipId, setConfirmingRemoveMembershipId] =
    useState<string | null>(null);


  const canViewMembers =
    hasPermission(
      PERMISSIONS.MEMBER_VIEW,
    );

  const canInviteMembers =
    hasPermission(
      PERMISSIONS.MEMBER_INVITE,
    );

  const canUpdateMembers =
    hasPermission(
      PERMISSIONS.MEMBER_UPDATE,
    );

  const canRemoveMembers =
    hasPermission(
      PERMISSIONS.MEMBER_REMOVE,
    );


  async function loadMembers() {
    if (
      !activeOrganizationId ||
      !canViewMembers
    ) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await getTeamMembers(
          activeOrganizationId,
        );

      setMembers(response.items);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load team members.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadMembers();
  }, [
    activeOrganizationId,
    canViewMembers,
  ]);


  async function handleInvite(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !activeOrganizationId ||
      !canInviteMembers
    ) {
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setInviting(true);
    setError("");
    setInvitationUrl("");

    try {
      const invitation =
        await inviteTeamMember(
          activeOrganizationId,
          {
            email: email.trim(),
            role,
          },
        );

      setInvitationUrl(
        invitation.invitation_url,
      );

      setEmail("");
      setRole("ACCOUNTANT");

      await loadMembers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create invitation.",
      );
    } finally {
      setInviting(false);
    }
  }


  function startEditingRole(
    member: TeamMember,
  ) {
    if (
      !canUpdateMembers ||
      member.role === "OWNER"
    ) {
      return;
    }

    setEditingMembershipId(
      member.membership_id,
    );

    setEditingRole(
      member.role as
        | "ADMIN"
        | "ACCOUNTANT"
        | "VIEWER",
    );

    setError("");
  }


  function cancelEditingRole() {
    if (savingRole) {
      return;
    }

    setEditingMembershipId(null);
  }


  async function handleRoleSave(
    membershipId: string,
  ) {
    if (
      !activeOrganizationId ||
      !canUpdateMembers
    ) {
      return;
    }

    setSavingRole(true);
    setError("");

    try {
      await updateTeamMemberRole(
        activeOrganizationId,
        membershipId,
        {
          role: editingRole,
        },
      );

      setEditingMembershipId(null);

      await loadMembers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update member role.",
      );
    } finally {
      setSavingRole(false);
    }
  }


  async function handleRemove(
    membershipId: string,
  ) {
    if (
      !activeOrganizationId ||
      !canRemoveMembers
    ) {
      return;
    }

    setRemovingMembershipId(
      membershipId,
    );

    setError("");

    try {
      await removeTeamMember(
        activeOrganizationId,
        membershipId,
      );

      setConfirmingRemoveMembershipId(
        null,
      );

      await loadMembers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove team member.",
      );
    } finally {
      setRemovingMembershipId(null);
    }
  }


  if (!canViewMembers) {
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
              view team members.
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
              Team management
            </p>

          </div>


          <Link
            to="/dashboard"
            className="text-sm font-semibold text-gray-400 hover:text-white"
          >
            ← Dashboard
          </Link>

        </div>

      </header>


      <main className="mx-auto max-w-6xl px-6 py-12">

        <section>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
                Team
              </p>

              <h1 className="mt-3 text-5xl font-black">
                Team members
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                Manage the people who can access
                this accounting organization.
              </p>

            </div>


            {canInviteMembers && (
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(
                    (current) => !current,
                  );
                  setInvitationUrl("");
                  setError("");
                }}
                className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 font-bold shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
              >
                {showInviteForm
                  ? "Close"
                  : "Invite Member"}
              </button>
            )}

          </div>

        </section>


        {showInviteForm &&
          canInviteMembers && (
            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-400">
                New invitation
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Invite a team member
              </h2>

              <form
                onSubmit={handleInvite}
                className="mt-6 grid gap-5 md:grid-cols-[1fr_220px_auto]"
              >

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
                    placeholder="employee@company.com"
                    disabled={inviting}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-pink-500"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Role
                  </label>

                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value as
                          | "ADMIN"
                          | "ACCOUNTANT"
                          | "VIEWER",
                      )
                    }
                    disabled={inviting}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-pink-500"
                  >

                    <option value="ADMIN">
                      Admin
                    </option>

                    <option value="ACCOUNTANT">
                      Accountant
                    </option>

                    <option value="VIEWER">
                      Viewer
                    </option>

                  </select>

                </div>


                <div className="flex items-end">

                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {inviting
                      ? "Creating..."
                      : "Create Invitation"}
                  </button>

                </div>

              </form>


              {invitationUrl && (
                <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-5">

                  <p className="text-sm font-semibold text-green-300">
                    Invitation created successfully.
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Development invitation
                    link:
                  </p>

                  <a
                    href={invitationUrl}
                    className="mt-3 block break-all text-sm font-semibold text-pink-400 hover:text-pink-300"
                  >
                    {invitationUrl}
                  </a>

                </div>
              )}

            </section>
          )}


        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}


        <section className="mt-10">

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-400">
              No team members found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">

              <div className="grid grid-cols-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-gray-400">

                <span>
                  Email
                </span>

                <span>
                  Role
                </span>

                <span>
                  Status
                </span>

                {(canUpdateMembers ||
                  canRemoveMembers) && (
                  <span>
                    Actions
                  </span>
                )}

              </div>


              {members.map((member) => {
                const isOwner =
                  member.role === "OWNER";

                const isEditing =
                  editingMembershipId ===
                  member.membership_id;

                const isConfirmingRemove =
                  confirmingRemoveMembershipId ===
                  member.membership_id;

                const isRemoving =
                  removingMembershipId ===
                  member.membership_id;


                return (
                  <div
                    key={member.membership_id}
                    className="border-b border-white/10 px-6 py-5 last:border-b-0 hover:bg-white/[0.02]"
                  >

                    <div className="grid grid-cols-4 gap-4">

                      <div className="flex items-center">

                        <span className="font-medium">
                          {member.email}
                        </span>

                      </div>


                      <div className="flex items-center">

                        {isEditing ? (
                          <select
                            value={
                              editingRole
                            }
                            onChange={(
                              event,
                            ) =>
                              setEditingRole(
                                event.target
                                  .value as
                                  | "ADMIN"
                                  | "ACCOUNTANT"
                                  | "VIEWER",
                              )
                            }
                            disabled={
                              savingRole
                            }
                            className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                          >
                            <option value="ADMIN">
                              Admin
                            </option>

                            <option value="ACCOUNTANT">
                              Accountant
                            </option>

                            <option value="VIEWER">
                              Viewer
                            </option>

                          </select>
                        ) : (
                          <span className="inline-flex rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">
                            {member.role}
                          </span>
                        )}

                      </div>


                      <div className="flex items-center">

                        <span className="text-sm text-green-400">
                          Active
                        </span>

                      </div>


                      {(canUpdateMembers ||
                        canRemoveMembers) && (
                        <div className="flex items-center gap-3">

                          {!isOwner &&
                            canUpdateMembers && (
                              isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleSave(
                                        member.membership_id,
                                      )
                                    }
                                    disabled={
                                      savingRole
                                    }
                                    className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
                                  >
                                    {savingRole
                                      ? "Saving..."
                                      : "Save"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={
                                      cancelEditingRole
                                    }
                                    disabled={
                                      savingRole
                                    }
                                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditingRole(
                                      member,
                                    )
                                  }
                                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                  Edit Role
                                </button>
                              )
                            )}


                          {!isOwner &&
                            canRemoveMembers && (
                              isConfirmingRemove ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemove(
                                        member.membership_id,
                                      )
                                    }
                                    disabled={
                                      isRemoving
                                    }
                                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
                                  >
                                    {isRemoving
                                      ? "Removing..."
                                      : "Confirm Remove"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmingRemoveMembershipId(
                                        null,
                                      )
                                    }
                                    disabled={
                                      isRemoving
                                    }
                                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmingRemoveMembershipId(
                                      member.membership_id,
                                    )
                                  }
                                  className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                                >
                                  Remove
                                </button>
                              )
                            )}

                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}
