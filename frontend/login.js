const $ = (s) => document.querySelector(s);
const chk = $('#chk');
const radiosTipo = document.querySelectorAll('input[name="tipo"]');
function atualizarCamposMercado() {
  const parceiro = document.querySelector('input[name="tipo"]:checked')?.value === 'parceiro';
  $('#dadosMercado').hidden = !parceiro;
  $('#dadosMercado').querySelectorAll('input').forEach((i) => { i.required = parceiro && i.name !== 'mercado_logo'; });
}
radiosTipo.forEach((r) => r.addEventListener('change', atualizarCamposMercado));
atualizarCamposMercado();
document.getElementById('temaBtn').onclick = () => SB.alternarTema();

// Quem já tem sessão desta aba vai direto para o painel certo (dashboard ou parceiro)
const sessaoJa = SB.get();
if (sessaoJa) location.replace(SB.destino(sessaoJa));

function msg(id, texto, ok) {
  const el = $(id);
  el.textContent = texto;
  el.classList.toggle('ok', !!ok);
}

$('#formCadastro').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    nome: f.nome.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    telefone: f.telefone.value.trim(),
    senha: f.senha.value,
    tipo: f.tipo.value,
    mercado_nome: f.mercado_nome?.value.trim() || '',
    mercado_local: f.mercado_local?.value.trim() || '',
    mercado_logo: f.mercado_logo?.value.trim() || ''
  };
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return msg('#msgCadastro', data.erro || 'Não foi possível cadastrar.');
    f.reset();
    msg('#msgCadastro', '');
    $('#formLogin').email.value = payload.email;
    msg('#msgLogin', 'Conta criada! Digite sua senha para entrar.', true);
    chk.checked = true;
  } catch (_err) {
    msg('#msgCadastro', 'Servidor indisponível. Tente novamente.');
  }
};

$('#formLogin').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: f.email.value.trim().toLowerCase(), senha: f.senha.value })
    });
    const data = await res.json();
    if (!res.ok) {
      f.senha.value = '';
      return msg('#msgLogin', data.erro || 'E-mail ou senha incorretos.');
    }
    SB.set(data);
    location.href = SB.destino(data);
  } catch (_err) {
    msg('#msgLogin', 'Servidor indisponível. Tente novamente.');
  }
};

if (location.hash === '#parceiro') { const r = document.querySelector('input[name="tipo"][value="parceiro"]'); if (r) { r.checked = true; atualizarCamposMercado(); chk.checked = false; } }
