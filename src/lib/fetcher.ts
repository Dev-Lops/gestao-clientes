export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao carregar dados')
  return res.json()
}
