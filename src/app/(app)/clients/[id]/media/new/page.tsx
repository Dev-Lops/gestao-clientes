import MediaNewForm from "@/app/(app)/clients/[id]/media/new/MediaNewForm";

export default async function MediaNewPage({ params, searchParams }: { params: { id: string }; searchParams: Promise<{ folder?: string; sub?: string }> }) {
  const { id } = params;
  const resolved = await searchParams;
  const folder = resolved.folder ?? "";
  const subfolder = resolved.sub ?? "";

  return (
    <div className="flex justify-center mt-10">
      <MediaNewForm clientId={id} folder={folder} subfolder={subfolder} />
    </div>
  );
}
