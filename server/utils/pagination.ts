// Helper konversi page/perPage → range Supabase (.range(from, to)) + bentuk hasil.
export function rangeFor(page: number, perPage: number): { from: number; to: number } {
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  return { from, to }
}

export function paginated<T>(data: T[], page: number, perPage: number, total: number) {
  return { data, page, perPage, total }
}
