const $ = (s) => document.querySelector(s);
document.getElementById('temaBtn').onclick = () => SB.alternarTema();

// Página exige login
const sessao = SB.get();
if (!sessao) location.replace('login.html');

async function carregar() {
  const res = await fetch('/api/auth/me', { headers: SB.headers() });
  if (res.status === 401) { SB.clear(); return location.replace('login.html'); }
  const u = await res.json();
  $('#nome').value = u.nome;
  $('#email').value = u.email;
  $('#telefone').value = u.telefone;
  $('#tipoConta').textContent = u.tipo === 'parceiro' ? 'Conta de parceiro (loja)' : 'Conta de consumidor';
}

function msg(texto, tipo) {
  const el = $('#msgPerfil');
  el.textContent = texto;
  el.className = 'msg' + (tipo ? ' ' + tipo : '');
}

$('#formPerfil').onsubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: SB.headers(),
      body: JSON.stringify({ nome: $('#nome').value, telefone: $('#telefone').value })
    });
    const data = await res.json();
    if (!res.ok) return msg(data.erro || 'Não foi possível salvar.', 'erro');
    const s = SB.get(); s.nome = data.nome; SB.set(s);
    msg('Dados atualizados com sucesso!', 'ok');
  } catch (_err) {
    msg('Servidor indisponível. Tente novamente.', 'erro');
  }
};

$('#btnExcluir').onclick = async () => {
  if (!confirm('Tem certeza? Sua conta será excluída permanentemente.')) return;
  try {
    await fetch('/api/auth/me', { method: 'DELETE', headers: SB.headers() });
  } catch (_err) { /* segue mesmo se falhar a chamada: limpa localmente */ }
  SB.clear();
  location.href = 'index.html';
};

$('#btnSair').onclick = async () => { await SB.logout(); location.href = 'index.html'; };

carregar();
