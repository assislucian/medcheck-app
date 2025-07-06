// Logout
function logout() {
  setToken(null);
  setUser(null);
  // Limpa todos os logs locais segmentados por CRM
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('guias_activity_log_')) localStorage.removeItem(key);
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
}

// Limpeza automática ao fechar o navegador
if (typeof window !== 'undefined') {
  window.addEventListener('unload', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('guias_activity_log_')) localStorage.removeItem(key);
    });
    sessionStorage.clear();
  });
}
