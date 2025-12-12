// Gestión de sesión en memoria (no persistente)
// Se limpia al cerrar la aplicación

let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
  console.log('Session set for user:', user?.username);
}

export function getCurrentUser() {
  return currentUser;
}

export function clearCurrentUser() {
  console.log('Session cleared for user:', currentUser?.username);
  currentUser = null;
}

export function isAuthenticated() {
  return currentUser !== null;
}
