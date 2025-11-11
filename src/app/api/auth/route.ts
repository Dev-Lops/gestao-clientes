import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { OWNER_EMAILS } from "@/config/env";
import { completeUserOnboarding } from "@/services/auth/onboarding";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=user_not_found`);
  }

  const normalizedEmail = user.email?.toLowerCase() ?? "";
  const adminClient = createSupabaseServiceRoleClient();

  const { data: existingMember } = await adminClient
    .from("app_members")
    .select("id, org_id, role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingMember) {
    if (!OWNER_EMAILS.includes(normalizedEmail)) {
      return NextResponse.redirect(
        `${origin}/unauthorized?reason=no_membership`,
      );
    }

    await completeUserOnboarding(supabase);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
