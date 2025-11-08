interface UnauthorizedSearchParams {
  message?: string
}

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams?: UnauthorizedSearchParams
}) {
  const message = searchParams?.message ?? 'Acesso não autorizado.'

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-semibold text-red-600">Acesso Negado</h1>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  )
}
