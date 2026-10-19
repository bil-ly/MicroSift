import Keycloak from 'keycloak-js'

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'microsift',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'microsift-frontend',
})

let initialization: Promise<boolean> | undefined

export function initializeAuth(): Promise<boolean> {
  initialization ??= keycloak.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })
  return initialization
}

export async function accessToken(): Promise<string> {
  await keycloak.updateToken(30)
  if (!keycloak.token) throw new Error('Session expired')
  return keycloak.token
}
