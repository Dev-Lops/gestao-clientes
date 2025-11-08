// app/(app)/clients/[id]/media/new/page.tsx

import MediaNewForm from "@/app/(app)/clients/[id]/media/new/MediaNewForm";

interface MediaNewPageProps {
  params: { id: string };
  searchParams: { folder?: string; sub?: string };
}

export default function MediaNewPage({ params, searchParams }: MediaNewPageProps) {
  const { id } = params;
  const folder = searchParams.folder ?? "";
  const subfolder = searchParams.sub ?? "";

  return (
    <div className="flex justify-center mt-10">
      <MediaNewForm clientId={id} folder={folder} subfolder={subfolder} />
    </div>
  );
}
