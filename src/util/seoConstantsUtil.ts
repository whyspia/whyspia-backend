// Helper function to normalize URLs by removing www. if present
export function normalizeURL(url: string): string {
  return url.replace(/^(https?:\/\/)(?:www\.)?/, '$1')
}

export function getFrontendURL(): string {
  const url = process.env.CLIENT_HOST_URL || 'http://localhost:3000'
  return normalizeURL(url)
}