const TOKEN_KEY = 'idl_ris_token';

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}
