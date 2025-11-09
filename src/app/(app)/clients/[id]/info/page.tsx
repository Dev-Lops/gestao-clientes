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
}
