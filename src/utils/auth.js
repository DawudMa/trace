// import Cookies from 'js-cookie'

const TokenKey = 'user'

export function getToken(key = TokenKey) {
  let session = ''
  try {
    session = JSON.parse(window.sessionStorage.getItem(key))
  } catch(e) {
    session = window.sessionStorage.getItem(key)
  }
  return session
}

export function setToken(key, value) {
  if (typeof value === 'object') value = JSON.stringify(value)
  return window.sessionStorage.setItem(key, value)
}

export function removeToken(key = TokenKey) {
  return window.sessionStorage.removeItem(key)
}

export function removeAll() {
  return window.sessionStorage.clear()
}