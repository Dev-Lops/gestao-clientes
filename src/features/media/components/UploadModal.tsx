"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadModalProps {
  clientId: string;
  folder: string;
}

export default function UploadModal({ clientId, folder }: UploadModalProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  }

  async function handleUpload() {
    if (files.length === 0) return toast.error("Selecione um arquivo.");

    setUploading(true);
    toast("⏳ Enviando arquivos...");

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", clientId);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    toast.success("✅ Upload concluído!");
    setFiles([]);
    setUploading(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
      >
        + Enviar arquivo
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Enviar arquivos para:{" "}
              <span className="text-indigo-600">{folder}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Área de Upload */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = Array.from(e.dataTransfer.files);
              setFiles((prev) => [...prev, ...dropped]);
            }}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-gradient-to-r from-white to-slate-50 hover:shadow-md cursor-pointer transition"
          >
            <UploadCloud className="h-10 w-10 text-indigo-500" />
            <p className="text-sm text-slate-600 mt-2">
              Clique ou arraste arquivos aqui
            </p>
            <input
              title="clique"
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleSelectFiles}
            />
          </div>

          {/* Pré-visualizações */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                layout
                className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4"
              >
                {files.map((file, i) => {
                  const isImage = file.type.startsWith("image/");
                  const preview = URL.createObjectURL(file);
                  return (
                    <motion.div
                      key={i}
                      layout
                      className="relative bg-white/80 rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="aspect-[4/5] bg-slate-100 relative">
                        {isImage ? (
                          <Image
                            src={preview}
                            alt={file.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <FileText className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-sm text-slate-700 truncate">
                        {file.name}
                      </div>
                      <button
                        title="cick"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-2 left-2 bg-white/80 p-1.5 rounded-full hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botões */}
          {files.length > 0 && (
            <div className="mt-6 flex justify-between">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full px-6 shadow-md"
              >
                {uploading ? "Enviando..." : "Enviar arquivos"}
              </Button>
              <Button variant="ghost" onClick={() => setFiles([])}>
                Limpar tudo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
