"use client";

import { useEffect, useState } from "react";

import { getApiBaseUrl } from "@/lib/config";
import { getBackendStatus, type BackendStatusResult } from "@/services/api-client";

const initialStatus: BackendStatusResult = {
  label: "Checking",
  message: "Frontend is checking whether the backend health endpoint is reachable.",
  tone: "neutral",
};

export function BackendStatusCard() {
  const [status, setStatus] = useState<BackendStatusResult>(initialStatus);

  useEffect(() => {
    let isActive = true;

    async function loadBackendStatus() {
      const nextStatus = await getBackendStatus(getApiBaseUrl());

      if (isActive) {
        setStatus(nextStatus);
      }
    }

    void loadBackendStatus();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <article className="status-card">
      <h2>Backend Connectivity</h2>
      <p className={`status-value status-value--${status.tone}`}>{status.label}</p>
      <p>{status.message}</p>
    </article>
  );
}
