import createHTTPError from '../utils/httpErrors';
import { LoginFormProps } from '../components/pages/LoginPage';

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

// (POST) logs an existing user in
export async function login(data: LoginFormProps) {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }
}
