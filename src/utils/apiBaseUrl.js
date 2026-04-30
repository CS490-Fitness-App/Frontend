const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const isLocalHost = (hostname) => (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  hostname === '::1'
)

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && isLocalHost(window.location.hostname)) {
    // Always use relative paths locally so Vite's proxy handles routing.
    // The proxy target is configured from VITE_API_BASE_URL in vite.config.js.
    return ''
  }

  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl)
  }

  if (typeof window !== 'undefined') {
    return trimTrailingSlash(window.location.origin)
  }

  return 'http://127.0.0.1:8000'
}

export const API_BASE_URL = getApiBaseUrl()