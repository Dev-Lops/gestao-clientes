"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

import { createOrganizationAction } from "./actions";

type SetupStep = "checking" | "form" | "done";

export default function SetupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SetupStep>("checking");

  useEffect(() => {
    let isActive = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/session", {
          credentials: "include",
        });
        if (!isActive) return;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await response.json()) as { orgId: string | null };
        if (data.orgId) {
          router.replace("/dashboard");
          return;
        }

        setStep("form");
      } catch {
        router.replace("/login");
      }
    }

    void checkSession();

    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await createOrganizationAction(orgName);
      toast.success("Organização criada com sucesso!");
      setStep("done");
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro inesperado. Tente novamente.",
      );
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
        <p className="mb-2 text-white/70">
          Escolha um nome para sua organização para começar.
        </p>

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
