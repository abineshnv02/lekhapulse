export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem("access_token"),
  );
}


export function saveTokens(
  accessToken: string,
  refreshToken: string,
): void {
  localStorage.setItem(
    "access_token",
    accessToken,
  );

  localStorage.setItem(
    "refresh_token",
    refreshToken,
  );
}


export function logout(): void {
  localStorage.removeItem(
    "access_token",
  );

  localStorage.removeItem(
    "refresh_token",
  );
}
