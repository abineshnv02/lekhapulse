import { useAuth } from "../context/AuthContext";


export default function OrganizationSwitcher() {
  const {
    user,
    activeOrganizationId,
    setActiveOrganizationId,
  } = useAuth();


  if (
    !user ||
    user.memberships.length <= 1
  ) {
    return null;
  }


  return (
    <div className="flex items-center gap-3">

      <label
        htmlFor="organization-switcher"
        className="sr-only"
      >
        Active organization
      </label>


      <select
        id="organization-switcher"
        value={
          activeOrganizationId ?? ""
        }
        onChange={(event) =>
          setActiveOrganizationId(
            event.target.value,
          )
        }
        className="max-w-[240px] rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm font-medium text-white outline-none backdrop-blur-xl transition hover:bg-white/10 focus:border-pink-500"
      >

        {user.memberships.map(
          (membership) => (
            <option
              key={
                membership.organization_id
              }
              value={
                membership.organization_id
              }
              className="bg-black text-white"
            >
              {membership.organization_name}
            </option>
          ),
        )}

      </select>

    </div>
  );
}
