<<<<<<< HEAD
export const dynamic = "force-dynamic";

import { getSessionProfile } from "@/lib/auth/session";
import ClientInfoPageClient from "./ClientInfoPageClient";

type ClientInfoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientInfoPage({ params }: ClientInfoPageProps) {
  const { id } = await params;
  const { role } = await getSessionProfile();

  return <ClientInfoPageClient id={id} userRole={role} />;
=======
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

import { ClientInfoPageClient } from "./ClientInfoPageClient";

interface ClientInfoPageProps {
  params: { id: string };
}

export default async function ClientInfoPage({ params }: ClientInfoPageProps) {
  const { id } = params;
  const { user, orgId, role } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/setup");
  }

  return <ClientInfoPageClient id={id} role={role} />;
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
}
