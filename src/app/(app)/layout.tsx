import { SidebarWithTopbar } from "@/components/layout/SidebarWithTopbar";
import { getSessionProfile } from "@/lib/auth/session";
import { AppRealtimeProvider } from "@/providers/AppRealtimeProvider";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, orgId, role } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/setup");
  }

  return (
    <AppRealtimeProvider orgId={orgId}>
      <SidebarWithTopbar role={role ?? "member"} userName={user.user_metadata?.full_name}>
        {children}
      </SidebarWithTopbar>
    </AppRealtimeProvider>
  );
}
