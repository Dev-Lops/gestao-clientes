import { NextResponse } from "next/server";

import { getSessionProfile } from "@/services/auth/session";

export async function GET() {
  const session = await getSessionProfile();

  if (!session.user) {
    return NextResponse.json(
      { error: "Sessão não encontrada." },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      orgId: session.orgId,
      role: session.role,
    },
    { status: 200 },
  );
}
