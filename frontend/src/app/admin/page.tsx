import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { PageShell } from "@/components/layout/page-shell";

export default function AdminPage() {
  return (
    <PageShell>
      <AdminUsersPanel />
    </PageShell>
  );
}
