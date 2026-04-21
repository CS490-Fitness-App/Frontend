import { API_BASE_URL } from './apiBaseUrl'

export const resolveMediaUrl = (value) => {
  if (!value) return ''
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value
  }

  if (value.startsWith('/')) {
    return `${API_BASE_URL}${value}`
  }

  return `${API_BASE_URL}/${value}`
}