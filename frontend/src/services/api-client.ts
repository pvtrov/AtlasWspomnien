export type BackendHealthResponse = {
  status: string;
  service: string;
};

export type BackendStatusResult = {
  label: string;
  message: string;
  tone: "neutral" | "success" | "failure";
};

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
