
export const getFrontendURL = (): string => {
  const url = process.env.NODE_ENV === 'production'
      ? `${process.env.CLIENT_HOST_URL}`
      : process.env.CLIENT_HOST_URL ?? 'http://localhost:3000'

  return url
}