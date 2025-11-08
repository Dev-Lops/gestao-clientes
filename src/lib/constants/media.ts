export const MEDIA_FOLDERS = [
  { value: "FOTOS_VIDEOS", label: "Fotos & Vídeos" },
  { value: "ROTEIROS_REELS", label: "Roteiros de Reels" },
  { value: "POSTS_PRONTOS", label: "Posts prontos" },
  { value: "STORIES_BASTIDORES", label: "Stories & bastidores" },
  { value: "MATERIAIS_CLIENTE", label: "Materiais do cliente" },
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number]["value"];

export function isMediaFolder(value: unknown): value is MediaFolder {
  if (typeof value !== "string") {
    return false;
  }

  return MEDIA_FOLDERS.some((folder) => folder.value === value);
}
