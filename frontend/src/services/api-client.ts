import { getApiBaseUrl } from "@/lib/config";

export type BackendHealthResponse = {
  status: string;
  service: string;
};

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  role: string;
  is_blocked: boolean;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser;
};

export type BackendStatusResult = {
  label: string;
  message: string;
  tone: "neutral" | "success" | "failure";
};

function buildApiUrl(path: string): string {
  const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${apiBaseUrl}${path}`;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string };
    return payload.detail || `Request failed with HTTP ${response.status}.`;
  } catch {
    return `Request failed with HTTP ${response.status}.`;
  }
}

export async function getBackendStatus(
  apiBaseUrl: string,
): Promise<BackendStatusResult> {
  const healthUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/health`;

  try {
    const response = await fetch(healthUrl);

    if (!response.ok) {
      return {
        label: "Unavailable",
        message: `Backend health check failed with HTTP ${response.status}.`,
        tone: "failure",
      };
    }

    const payload = (await response.json()) as BackendHealthResponse;

    if (payload.status === "ok" && payload.service === "backend") {
      return {
        label: "Connected",
        message: "Frontend successfully reached the backend health endpoint.",
        tone: "success",
      };
    }

    return {
      label: "Unexpected response",
      message: "Backend responded, but the health payload did not match expectations.",
      tone: "failure",
    };
  } catch {
    return {
      label: "Unavailable",
      message: "Frontend could not reach the backend health endpoint.",
      tone: "failure",
    };
  }
}

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await fetch(buildApiUrl("/api/v1/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as RegisterResponse;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(buildApiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as LoginResponse;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(buildApiUrl("/api/v1/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as CurrentUserResponse;
  return payload.user;
}
