import createHTTPError from '../utils/httpErrors';
import { LoginFormProps } from '../components/pages/LoginPage';
import { SignupFormProps } from '../components/pages/SignupPage';

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

// (POST) signs a user up
export async function signup(data: SignupFormProps) {
  const response = await fetch('/api/v1/auth/signup', {
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

interface IEmail {
  email: string;
}

// (POST) generates email OTP
export async function generateEmailOTP(data: IEmail) {
  const response = await fetch('api/v1/auth/verification-link', {
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

// (PATCH) verifies email address
export async function verifyEmail(otp: string) {
  const response = await fetch(`api/v1/auth/verify-email/${otp}`, {
    method: 'PATCH',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }
}
