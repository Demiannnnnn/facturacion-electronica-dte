import keytar from 'keytar';

const SERVICE = 'sistema-facturacion';
const REFRESH_ACCOUNT = 'refresh-token';

let accessToken = null;

export async function setRefreshToken(token) {
  if (!token) return;
  try {
    await keytar.setPassword(SERVICE, REFRESH_ACCOUNT, token);
  } catch (e) {
    console.error('Error saving refresh token to keytar:', e);
  }
}

export async function getRefreshToken() {
  try {
    return await keytar.getPassword(SERVICE, REFRESH_ACCOUNT);
  } catch (e) {
    console.error('Error reading refresh token from keytar:', e);
    return null;
  }
}

export async function deleteRefreshToken() {
  try {
    return await keytar.deletePassword(SERVICE, REFRESH_ACCOUNT);
  } catch (e) {
    console.error('Error deleting refresh token from keytar:', e);
    return false;
  }
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export async function setTokens({ access, refresh }) {
  if (access) setAccessToken(access);
  if (refresh) await setRefreshToken(refresh);
}

export default {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  setAccessToken,
  getAccessToken,
  setTokens
};
