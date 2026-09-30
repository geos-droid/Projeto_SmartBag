// Sessão do usuário (compartilhado por index, login, dashboard, parceiro e conta).
// Guardado em sessionStorage: some ao fechar a aba, exigindo login de novo — não é o
// mesmo que "lembrar de mim", é a sessão da visita atual.
const SB = (function () {
  const CHAVE = 'sb_sessao';
  const TEMA = 'sb_tema';

  function get() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE)); } catch { return null; }
  }
  function set(sessao) { sessionStorage.setItem(CHAVE, JSON.stringify(sessao)); }
  function clear() { sessionStorage.removeItem(CHAVE); }
  function headers() {
    const s = get();
    const h = { 'Content-Type': 'application/json' };
    if (s && s.token) h.Authorization = `Bearer ${s.token}`;
    return h;
  }
  async function logout() {
    const s = get();
    try { if (s && s.token) await fetch('/api/auth/logout', { method: 'POST', headers: headers() }); } catch { /* offline: ignora */ }
    clear();
  }
  // Página de destino depois do login, conforme o tipo de conta
  function destino(sessao) { return sessao.tipo === 'parceiro' ? 'parceiro.html' : 'dashboard.html'; }

  // Tema claro/escuro, aplicado em todas as páginas
  function temaAtual() { return localStorage.getItem(TEMA) || 'claro'; }
  function aplicarTema(t) {
    document.documentElement.setAttribute('data-tema', t);
    localStorage.setItem(TEMA, t);
  }
  function iniciarTema() { aplicarTema(temaAtual()); }
  function alternarTema() { aplicarTema(temaAtual() === 'escuro' ? 'claro' : 'escuro'); }

  return { get, set, clear, headers, logout, destino, iniciarTema, alternarTema, temaAtual };
})();
SB.iniciarTema();
