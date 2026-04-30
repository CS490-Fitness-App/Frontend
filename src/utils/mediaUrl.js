import { API_BASE_URL } from './apiBaseUrl'

export const resolveMediaUrl = (value) => {
  if (!value) return ''

  const normalized = String(value).trim()
  if (!normalized) return ''

  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return ''
  }

  if (/^(?:https?:)?\/\//i.test(normalized)) {
    return value
  }

  if (normalized.startsWith('/')) {
    return `${API_BASE_URL}${normalized}`
  }

  return `${API_BASE_URL}/${normalized}`
}