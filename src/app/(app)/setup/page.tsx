"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SetupPage() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"checking" | "form" | "done">("checking");
  const router = useRouter();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.user_metadata?.org_id) {
        router.replace("/dashboard");
      } else {
        setStep("form");
      }
    };
    check();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("Usuário não autenticado.");
      router.push("/login");
      return;
    }

    // 🔹 Cria organização
    const { data: org, error: orgError } = await supabase
      .from("app_orgs")
      .insert({
        name: orgName || "Minha Organização",
        owner_user_id: user.id,
      })
      .select("id")
      .single();

    if (orgError) {
      console.error("Erro ao criar org:", orgError);
      alert("Erro ao criar organização.");
      setLoading(false);
      return;
    }

    // 🔹 Cria membro vinculado à organização
    const { error: memberError } = await supabase.from("app_members").insert({
      user_id: user.id,
      org_id: org.id,
      role: "owner",
      status: "active",
      full_name: user.user_metadata?.full_name ?? "Proprietário",
    });

    if (memberError) {
      console.error("Erro ao criar membro:", memberError);
      alert("Erro ao criar membro.");
      setLoading(false);
      return;
    }

    // 🔹 Atualiza metadados do usuário
    await supabase.auth.updateUser({
      data: { org_id: org.id, role: "owner" },
    });

    // 🔹 Força refresh do cookie local para refletir novo org_id
    await supabase.auth.refreshSession();

    setStep("done");
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  if (step === "checking") {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Verificando conta...
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex h-screen items-center justify-center text-white text-lg">
        ✅ Organização criada! Redirecionando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-lg flex flex-col gap-4 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold">Criar Organização</h1>
        <p className="text-white/70 mb-2">
          Escolha um nome para sua organização para começar.
        </p>

        <Input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Nome da organização"
          required
          className="bg-white text-slate-900"
        />

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Criando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </form>
    </div>
  );
}
