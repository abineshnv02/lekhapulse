import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  type MeResponse,
} from "../api/auth";

import {
  isAuthenticated,
  logout as clearStoredTokens,
} from "../auth/auth";


const ACTIVE_ORGANIZATION_STORAGE_KEY =
  "active_organization_id";


interface AuthContextValue {
  user: MeResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  activeOrganizationId: string | null;
  setActiveOrganizationId: (
    organizationId: string,
  ) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  hasPermission: (
    permission: string,
  ) => boolean;
}


const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<MeResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    activeOrganizationId,
    setActiveOrganizationIdState,
  ] = useState<string | null>(null);


  /*
   * Change the active organization.
   *
   * We verify that the selected organization
   * actually belongs to the authenticated user.
   */
  function setActiveOrganizationId(
    organizationId: string,
  ) {
    const belongsToUser =
      user?.memberships.some(
        (membership) =>
          membership.organization_id ===
          organizationId,
      );

    if (!belongsToUser) {
      return;
    }

    setActiveOrganizationIdState(
      organizationId,
    );

    localStorage.setItem(
      ACTIVE_ORGANIZATION_STORAGE_KEY,
      organizationId,
    );
  }


  async function refreshUser() {
    if (!isAuthenticated()) {
      setUser(null);
      setActiveOrganizationIdState(null);
      return;
    }

    try {
      const currentUser =
        await getCurrentUser();

      setUser(currentUser);

      const memberships =
        currentUser.memberships;

      if (memberships.length === 0) {
        setActiveOrganizationIdState(null);

        localStorage.removeItem(
          ACTIVE_ORGANIZATION_STORAGE_KEY,
        );

        return;
      }

      const storedOrganizationId =
        localStorage.getItem(
          ACTIVE_ORGANIZATION_STORAGE_KEY,
        );

      const storedOrganizationStillValid =
        storedOrganizationId &&
        memberships.some(
          (membership) =>
            membership.organization_id ===
            storedOrganizationId,
        );

      if (storedOrganizationStillValid) {
        setActiveOrganizationIdState(
          storedOrganizationId,
        );
        return;
      }

      /*
       * If there is no valid previous selection,
       * use the user's first available membership.
       */
      const fallbackOrganizationId =
        memberships[0].organization_id;

      setActiveOrganizationIdState(
        fallbackOrganizationId,
      );

      localStorage.setItem(
        ACTIVE_ORGANIZATION_STORAGE_KEY,
        fallbackOrganizationId,
      );
    } catch {
      clearStoredTokens();
      setUser(null);
      setActiveOrganizationIdState(null);

      localStorage.removeItem(
        ACTIVE_ORGANIZATION_STORAGE_KEY,
      );
    }
  }


  function hasPermission(
    permission: string,
  ): boolean {
    if (!activeOrganizationId) {
      return false;
    }

    const membership =
      user?.memberships.find(
        (item) =>
          item.organization_id ===
          activeOrganizationId,
      );

    if (!membership) {
      return false;
    }

    return membership.permissions.includes(
      permission,
    );
  }


  function handleLogout() {
    clearStoredTokens();
    setUser(null);
    setActiveOrganizationIdState(null);

    localStorage.removeItem(
      ACTIVE_ORGANIZATION_STORAGE_KEY,
    );
  }


  useEffect(() => {
    refreshUser()
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:
          user !== null,
        activeOrganizationId,
        setActiveOrganizationId,
        refreshUser,
        logout: handleLogout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}
