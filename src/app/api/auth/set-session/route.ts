import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  access_token: z.string().min(10),
  refresh_token: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = schema.parse(await req.json());
    const response = NextResponse.json({ ok: true });
    const supabase = await createSupabaseRouteHandlerClient(response);

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error("Erro ao sincronizar sessão:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Payload inválido", issues: err.issues },
        { status: 400 },
      );
    }

    console.error("Erro ao sincronizar sessão:", err);
    return NextResponse.json(
      { error: "Erro ao sincronizar sessão." },
      { status: 500 },
    );
  }
}
