import { AuthForm } from "@/components/auth/auth-form";
import { PageShell } from "@/components/layout/page-shell";

export default function RegisterPage() {
  return (
    <PageShell>
      <AuthForm mode="register" />
    </PageShell>
  );
}
