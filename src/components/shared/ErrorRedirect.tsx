"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ErrorRedirect({ message }: { message: string }) {
  const router = useRouter();

  useEffect(() => {
    toast.error(message, {
      description: "Você será redirecionado para a lista de clientes.",
    });

    const timer = setTimeout(() => {
      router.push("/clients");
    }, 2500);

    return () => clearTimeout(timer);
  }, [message, router]);

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-semibold text-slate-800">
        {message || "Ocorreu um erro inesperado."}
      </h2>
      <p className="text-slate-500 text-sm">
        Redirecionando para a página de clientes...
      </p>
    </div>
  );
}
