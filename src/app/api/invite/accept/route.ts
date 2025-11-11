import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  acceptInvitation,
  InvitationError,
  InvitationExpiredError,
  InvitationNotFoundError,
} from "@/services/repositories/invitations";

function redirectTo(
  origin: string,
  path: string,
  query: Record<string, string> = {},
) {
  const url = new URL(path, origin);

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url.toString());
}

function getToken(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("token");
}

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const token = getToken(request);

  if (!token) {
    return redirectTo(origin, "/login", { error: "invite" });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "redirectTo",
      `/invite/accept?token=${encodeURIComponent(token)}`,
    );
    return NextResponse.redirect(loginUrl.toString());
  }

  try {
    await acceptInvitation({ token, userId: user.id });
    return redirectTo(origin, "/dashboard", { invite: "ok" });
  } catch (error) {
    if (error instanceof InvitationNotFoundError) {
      return redirectTo(origin, "/dashboard", { invite: "invalid" });
    }

    if (error instanceof InvitationExpiredError) {
      return redirectTo(origin, "/dashboard", { invite: "expired" });
    }

    if (error instanceof InvitationError) {
      return redirectTo(origin, "/dashboard", { invite: "error" });
    }

    throw error;
  }
}
