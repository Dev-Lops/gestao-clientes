import { NextResponse } from "next/server";

export async function GET() {
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const shortKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + "...";

  return NextResponse.json({
    hasServiceKey,
    shortKey,
    envKeys: Object.keys(process.env).filter((k) => k.includes("SUPABASE")),
  });
}
