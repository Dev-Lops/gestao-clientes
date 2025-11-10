// app/invite/accept/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

class InviteAcceptanceError extends Error {}

class InviteService {
  constructor(
    private readonly supabase: Awaited<
      ReturnType<typeof createSupabaseServerClient>
    >,
  ) {}

  async acceptInvite({ userId, token }: { userId: string; token: string }) {
    console.info("Invite accepted for user", userId, "with token", token);
    return { userId, token };
  }
}

const redirectTo = (
  origin: string,
  path: string,
  query: Record<string, string> = {},
) => {
  const url = new URL(path, origin);

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url.toString());
};

const getTokenFrom = (request: NextRequest): string | null => {
  const url = new URL(request.url);

  return url.searchParams.get("token");
};

export async function GET(req: NextRequest) {
  const token = getTokenFrom(req);
  const origin = new URL(req.url).origin;

  if (!token) {
    return redirectTo(origin, "/login", { error: "token" });
  }

  const supabase = await createSupabaseServerClient();
  const inviteService = new InviteService(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(origin, "/login", {
      next: `/invite/accept?token=${encodeURIComponent(token)}`,
    });
  }

  try {
    await inviteService.acceptInvite({
      userId: user.id,
      token,
    });

    return redirectTo(origin, "/dashboard", { invite: "ok" });
  } catch (error) {
    if (error instanceof InviteAcceptanceError) {
      return redirectTo(origin, "/dashboard", { error: "invite" });
    }

    throw error;
  }
}
