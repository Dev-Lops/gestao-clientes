import MediaNewForm from "@/app/(app)/clients/[id]/media/new/MediaNewForm";

export default async function MediaNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ folder?: string; sub?: string }>;
}) {
  const [resolvedParams, resolvedSearch] = await Promise.all([
    params,
    searchParams,
  ]);
  const folder = resolvedSearch.folder ?? "";
  const subfolder = resolvedSearch.sub ?? "";

  return (
    <div className="flex justify-center mt-10">
      <MediaNewForm
        clientId={resolvedParams.id}
        folder={folder}
        subfolder={subfolder}
      />
    </div>
  );
}
