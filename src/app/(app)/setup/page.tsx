"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SetupStep = "checking" | "form" | "done";

export default function SetupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SetupStep>("checking");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let isActive = true;

    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!isActive) return;

      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.user_metadata?.org_id) {
        router.replace("/dashboard");
        return;
      }

      setStep("form");
    }

    void checkUser();

    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        toast.error("Usuário não autenticado.");
        router.push("/login");
        return;
      }

      const { data: org, error: orgError } = await supabase
        .from("app_orgs")
        .insert({
          name: orgName || "Minha Organização",
          owner_user_id: user.id,
        })
        .select("id")
        .single();

      if (orgError || !org) {
        console.error("Erro ao criar organização:", orgError);
        toast.error("Erro ao criar organização.");
        return;
      }

      const { error: memberError } = await supabase.from("app_members").insert({
        user_id: user.id,
        org_id: org.id,
        role: "owner",
        status: "active",
        full_name: user.user_metadata?.full_name ?? "Proprietário",
      });

      if (memberError) {
        console.error("Erro ao criar membro:", memberError);
        toast.error("Erro ao criar membro.");
        return;
      }

      await supabase.auth.updateUser({
        data: { org_id: org.id, role: "owner" },
      });
      await supabase.auth.refreshSession();

      toast.success("Organização criada com sucesso!");
      setStep("done");
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (error) {
      console.error("Erro inesperado ao configurar organização:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "checking") {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Verificando conta...
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-white">
        ✅ Organização criada! Redirecionando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-8 text-white">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md"
      >
        <h1 className="text-3xl font-bold">Criar Organização</h1>
        <p className="mb-2 text-white/70">Escolha um nome para sua organização para começar.</p>

        <Input
          value={orgName}
          onChange={(event) => setOrgName(event.target.value)}
          placeholder="Nome da organização"
          required
          className="bg-white text-slate-900"
          autoFocus
        />

        <Button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Criando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </form>
    </div>
  );
}
