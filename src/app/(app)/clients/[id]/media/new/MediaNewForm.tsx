"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

async function uploadMediaThroughApi(
  formData: FormData,
  onProgress: (percent: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.responseType = "json";

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      const response = request.response as { error?: string } | null;
      reject(new Error(response?.error ?? "Falha no upload."));
    };

    request.onerror = () => {
      reject(new Error("Falha no upload."));
    };

    request.send(formData);
  });
}

interface MediaNewFormProps {
  clientId: string;
  folder: string;
  subfolder?: string;
}

export default function MediaNewForm({ clientId, folder, subfolder }: MediaNewFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setPreviewUrl(null);
    return undefined;
  }, [file]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return toast.error("Selecione um arquivo para enviar.");
    if (!folder) return toast.error("Selecione uma pasta válida.");

    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", clientId);
      formData.append("folder", folder);
      if (subfolder) formData.append("subfolder", subfolder);
      formData.append("title", title || file.name);

      await uploadMediaThroughApi(formData, setProgress);

      toast.success("Upload concluído com sucesso!");
      const params = new URLSearchParams({ folder });
      if (subfolder) params.set("sub", subfolder);
      router.push(`/clients/${clientId}/media?${params.toString()}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro ao enviar arquivo.";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="max-w-lg w-full space-y-6 p-8 rounded-3xl shadow-xl border border-slate-200 bg-white">
      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
        <UploadCloud className="h-5 w-5 text-indigo-600" />
        Enviar novo arquivo
      </h2>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Ex: Fotos da campanha de inverno"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="file">Arquivo</Label>
          <Input
            id="file"
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {previewUrl && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700 mb-2">Pré-visualização</p>
            {file?.type.startsWith("image/") ? (
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            ) : file?.type.startsWith("video/") ? (
              <video src={previewUrl} controls className="rounded-md w-full h-48 object-cover" />
            ) : (
              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="h-6 w-6" /> <span className="truncate">{file?.name}</span>
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          disabled={isUploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          {isUploading ? `Enviando... ${progress}%` : "Enviar arquivo"}
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-2">
        O arquivo será salvo em: <span className="text-indigo-600 font-medium">{folder}</span>
        {subfolder ? <span className="text-indigo-600 font-medium">{` / ${subfolder}`}</span> : null}
      </p>
    </Card>
  );
}
