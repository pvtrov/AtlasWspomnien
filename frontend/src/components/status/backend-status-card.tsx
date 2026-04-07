"use client";

import { useEffect, useState } from "react";

import { getApiBaseUrl } from "@/lib/config";
import { getBackendStatus, type BackendStatusResult } from "@/services/api-client";

const initialStatus: BackendStatusResult = {
  label: "Sprawdzanie",
  message: "Interfejs sprawdza, czy endpoint zdrowia backendu jest osiągalny.",
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
      <h2>Połączenie z backendem</h2>
      <p className={`status-value status-value--${status.tone}`}>{status.label}</p>
      <p>{status.message}</p>
    </article>
  );
}
