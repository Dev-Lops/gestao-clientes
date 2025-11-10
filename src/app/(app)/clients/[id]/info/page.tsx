import { getSessionProfile } from "@/services/auth/session";
import { redirect } from "next/navigation";

import ClientInfoPageClient from "./ClientInfoPageClient";

interface ClientInfoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientInfoPage({ params }: ClientInfoPageProps) {
  const { id } = await params;
  const { user, orgId, role } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/setup");
  }

  return <ClientInfoPageClient id={id} userRole={role ?? "guest"} />;
}
