// Gestión de sesión en memoria (no persistente)
// Se limpia al cerrar la aplicación

let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
  console.log('Session set for user:', user?.email);
}

export function getCurrentUser() {
  return currentUser;
}

export function clearCurrentUser() {
  console.log('Session cleared for user:', currentUser?.email);
  currentUser = null;
}

export function isAuthenticated() {
  return currentUser !== null;
}
