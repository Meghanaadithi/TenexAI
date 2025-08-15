export const auth = {
  isLoggedIn() { return !!localStorage.getItem('token'); },
  login(token) { localStorage.setItem('token', token); },
  logout() { localStorage.removeItem('token'); }
}
