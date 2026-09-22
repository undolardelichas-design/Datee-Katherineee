const AUTH_KEY = 'datee-auth'

export function isUnlocked() {
  return sessionStorage.getItem(AUTH_KEY) === 'true'
}

export function unlock() {
  sessionStorage.setItem(AUTH_KEY, 'true')
}
