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
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gerar preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  // Upload
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !folder) return setError("Selecione um arquivo e uma pasta válida.");

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

      // Envia o arquivo com progresso
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject());
        xhr.onerror = () => reject(new Error("Falha no upload."));
        xhr.send(formData);
      });

      toast.success("Upload concluído!");
      router.push(`/clients/${clientId}/media?folder=${folder}${subfolder ? `&sub=${subfolder}` : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="max-w-lg space-y-6 p-8 rounded-3xl shadow-lg bg-white/95 backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
        <UploadCloud className="h-5 w-5 text-indigo-600" /> Enviar arquivo
      </h2>

      <form onSubmit={handleUpload} className="space-y-5">
        <div>
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Campanha de verão"
          />
        </div>

        <div>
          <Label>Arquivo</Label>
          <Input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {previewUrl && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-800 mb-2">Pré-visualização</p>
            {file?.type.startsWith("image/") ? (
              <Image
                src={previewUrl}
                alt="Preview"
                width={250}
                height={180}
                className="rounded-md object-cover"
              />
            ) : file?.type.startsWith("video/") ? (
              <video src={previewUrl} controls className="rounded-md h-48" />
            ) : (
              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="h-6 w-6" /> <span className="truncate">{file?.name}</span>
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={isUploading}
        >
          {isUploading ? `Enviando... ${progress}%` : "Enviar arquivo"}
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center">
        O arquivo será salvo em:{" "}
        <span className="text-indigo-600 font-medium">
          {folder} {subfolder ? ` / ${subfolder}` : ""}
        </span>
      </p>
    </Card>
  );
}
