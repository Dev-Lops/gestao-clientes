// src/lib/supabase/pkce.ts
export async function generatePKCEPair() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  )
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return { codeVerifier, codeChallenge }
}
