import normalizeUrl from 'normalize-url'

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86_400
export const WEEK_SECONDS = 604_800
export const MONTH_SECONDS = 2_628_000
export const YEAR_SECONDS = 31_536_000

export function compareFn<T>(
  a: T,
  b: T,
  orderBy: keyof T,
  orderDirection: string
) {
  const value = a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0
  return orderDirection === 'asc' ? value : -1 * value
}

export const sortStringByOrder =
  (orderDirection: string) => (a: string, b: string) => {
    return orderDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  }

export const sortNumberByOrder =
  (orderDirection: string) => (a: number, b: number) => {
    return orderDirection === 'asc' ? a - b : b - a
  }

export function getDateAfterXDays(x: number) {
  const date = new Date()
  date.setDate(date.getDate() + x)

  return date
}

export function normalize(url: string) {
  return normalizeUrl(url)
}
