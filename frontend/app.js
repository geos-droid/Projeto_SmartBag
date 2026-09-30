const menu = document.getElementById('menu');
document.getElementById('burger').onclick = () => menu.classList.toggle('aberto');
menu.querySelectorAll('a').forEach((a) => {
  a.onclick = () => menu.classList.remove('aberto');
});

// "Minha Conta" leva ao login se ninguém entrou, ou direto ao painel de quem já entrou
const sessaoAtual = SB.get();
if (sessaoAtual && sessaoAtual.nome) {
  const link = document.getElementById('contaLink');
  link.textContent = `Olá, ${sessaoAtual.nome.split(' ')[0]}`;
  link.href = SB.destino(sessaoAtual);
}

// Alterna entre tema claro e escuro (preferência salva no navegador)
document.getElementById('temaBtn').onclick = () => SB.alternarTema();

const regras = {
  nome: (v) => v.trim().length >= 3 || 'Informe seu nome (minimo 3 letras).',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Informe um e-mail valido, como nome@email.com.',
  msg: (v) => v.trim().length >= 10 || 'Escreva uma mensagem com pelo menos 10 caracteres.'
};

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  let valido = true;
  const payload = {
    assunto: document.getElementById('assunto').value,
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    msg: document.getElementById('msg').value
  };
  for (const campo in regras) {
    const r = regras[campo](payload[campo]);
    document.querySelector(`[data-for="${campo}"]`).textContent = r === true ? '' : r;
    if (r !== true) valido = false;
  }
  const ok = document.getElementById('ok');
  if (!valido) {
    ok.textContent = '';
    return;
  }
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      ok.textContent = data.erro || 'Nao foi possivel enviar.';
      return;
    }
    ok.textContent = 'Mensagem enviada! Responderemos em breve.';
    e.target.reset();
  } catch (_err) {
    ok.textContent = 'Servidor indisponivel. Tente novamente.';
  }
});
