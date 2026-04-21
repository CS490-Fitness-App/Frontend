const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const isLocalHost = (hostname) => (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  hostname === '::1'
)

const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl)
  }

  if (typeof window !== 'undefined' && !isLocalHost(window.location.hostname)) {
    return trimTrailingSlash(window.location.origin)
  }

  return 'http://127.0.0.1:8000'
}

export const API_BASE_URL = getApiBaseUrl()