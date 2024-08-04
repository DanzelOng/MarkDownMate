type AuthStatusResponse =
  | { isAuthenticated: false }
  | { isAuthenticated: true; username: string; email: string };

// (GET) get authentication status of user
export async function getAuthStatus(): Promise<AuthStatusResponse> {
  const response = await fetch('/api/v1/auth/status', {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
  });

  return await response.json();
}
