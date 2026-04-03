export type BackendStatusPlaceholder = {
  label: string;
  message: string;
};

export async function getBackendStatusPlaceholder(): Promise<BackendStatusPlaceholder> {
  return {
    label: "Placeholder ready",
    message:
      "A shared frontend service layer is in place. Real backend status checks belong to the separate connectivity task.",
  };
}
