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
    if (typeof window !== 'undefined' && isLocalHost(window.location.hostname)) {
      const normalizedConfiguredBaseUrl = trimTrailingSlash(configuredBaseUrl)
      if (
        normalizedConfiguredBaseUrl === 'http://127.0.0.1:8000' ||
        normalizedConfiguredBaseUrl === 'http://localhost:8000'
      ) {
        return ''
      }
    }

    return trimTrailingSlash(configuredBaseUrl)
  }

  if (typeof window !== 'undefined') {
    if (isLocalHost(window.location.hostname)) {
      return ''
    }

    return trimTrailingSlash(window.location.origin)
  }

  return 'http://127.0.0.1:8000'
}

export const API_BASE_URL = getApiBaseUrl()