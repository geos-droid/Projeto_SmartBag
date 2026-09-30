const $ = (s) => document.querySelector(s);
document.getElementById('temaBtn').onclick = () => SB.alternarTema();

// Página exclusiva de parceiros logados
const sessao = SB.get();
if (!sessao) location.replace('login.html');
else if (sessao.tipo !== 'parceiro') location.replace('dashboard.html');

const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// dd/mm/aa <-> aaaa-mm-dd (o back-end guarda no formato brasileiro; o <input type=date> usa ISO)
const brParaIso = (br) => { const [d, m, a] = br.split('/'); return `20${a}-${m}-${d}`; };
const isoParaBr = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a.slice(2)}`; };
const vencido = (br) => {
  const [d, m, a] = br.split('/').map(Number);
  return new Date(2000 + a, m - 1, d) < new Date(new Date().toDateString());
};

function msg(texto, tipo) {
  const el = $('#msgProduto');
  el.textContent = texto;
  el.className = 'msg' + (tipo ? ' ' + tipo : '');
}

async function carregarPerfilMercado() {
  try { const res = await fetch('/api/auth/me', { headers: SB.headers() }); if (!res.ok) return; const u = await res.json(); const unidade = `UN-${String(u.id).padStart(3,'0')}`; $('#perfilMercado').textContent = u.mercado_nome || u.nome; $('#perfilUnidade').textContent = `${unidade} · gerado automaticamente`; $('#mercadoNome').value = u.mercado_nome || ''; $('#mercadoLocal').value = u.mercado_local || ''; $('#mercadoLogo').value = u.mercado_logo || ''; $('#perfilLogo').src = u.mercado_logo || '/img/logo-l.png'; } catch {}
}
$('#formMercado').onsubmit = async (e) => { e.preventDefault(); const el=$('#msgMercado'); try { const res=await fetch('/api/auth/market',{method:'PUT',headers:SB.headers(),body:JSON.stringify({mercado_nome:$('#mercadoNome').value.trim(),mercado_local:$('#mercadoLocal').value.trim(),mercado_logo:$('#mercadoLogo').value.trim()})}); const data=await res.json(); if(!res.ok){el.textContent=data.erro||'Não foi possível salvar.';el.className='msg erro';return;} el.textContent='Dados da loja atualizados!';el.className='msg ok';$('#perfilMercado').textContent=data.mercado_nome;$('#perfilUnidade').textContent=`${data.unidade_id} · gerado automaticamente`;$('#perfilLogo').src=data.mercado_logo||'/img/logo-l.png'; } catch {el.textContent='Servidor indisponível.';el.className='msg erro';} };

async function carregarProdutos() {
  const res = await fetch('/api/products/mine', { headers: SB.headers() });
  if (res.status === 401) { SB.clear(); return location.replace('login.html'); }
  const lista = await res.json();
  renderResumo(lista);
  renderLista(lista);
}

function renderResumo(lista) {
  const ativos = lista.filter((p) => p.ativo !== false && p.estoque > 0 && !vencido(p.val)).length;
  const vencidos = lista.filter((p) => vencido(p.val)).length;
  $('#resumo').innerHTML = `
   <div class="cartaoResumo">Produtos cadastrados<b>${lista.length}</b></div>
   <div class="cartaoResumo">Disponíveis para venda<b>${ativos}</b></div>
   <div class="cartaoResumo">Vencidos<b>${vencidos}</b></div>`;
}

function renderLista(lista) {
  $('#listaProdutos').innerHTML = lista.length ? lista.map((p) => `
   <div class="linhaProd">
    <div class="info"><b>${p.nome}</b><small>${brl(p.preco)} · ${p.estoque} un.</small></div>
    <span class="tagCat">${p.categoria}</span>
    ${vencido(p.val) ? '<span class="tagVencido">vencido</span>' : ''}
    <div class="acoesProd">
     <button class="editar" data-editar="${p.id}">Editar</button>
     <button class="excluir" data-excluir="${p.id}">Excluir</button>
    </div>
   </div>`).join('') : '<p class="vazio">Você ainda não cadastrou produtos. Use o formulário acima.</p>';
}

function modoEdicao(p) {
  $('#id').value = p.id;
  $('#nome').value = p.nome;
  $('#categoria').value = p.categoria;
  $('#preco').value = p.preco;
  $('#estoque').value = p.estoque;
  $('#fab').value = brParaIso(p.fab);
  $('#val').value = brParaIso(p.val);
  $('#emoji').value = p.emoji || '';
  $('#tituloForm').textContent = `Editando "${p.nome}"`;
  $('#btnSalvar').textContent = 'Salvar alterações';
  $('#btnCancelar').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function modoCriacao() {
  $('#formProduto').reset();
  $('#id').value = '';
  $('#tituloForm').textContent = 'Cadastrar produto';
  $('#btnSalvar').textContent = 'Cadastrar produto';
  $('#btnCancelar').hidden = true;
  msg('');
}
$('#btnCancelar').onclick = modoCriacao;

$('#listaProdutos').onclick = async (e) => {
  const editarId = e.target.dataset.editar;
  const excluirId = e.target.dataset.excluir;
  if (editarId) {
    const res = await fetch(`/api/products/${editarId}`, { headers: SB.headers() });
    if (res.ok) modoEdicao(await res.json());
    return;
  }
  if (excluirId) {
    if (!confirm('Excluir este produto? Essa ação não pode ser desfeita.')) return;
    const res = await fetch(`/api/products/${excluirId}`, { method: 'DELETE', headers: SB.headers() });
    const data = await res.json();
    if (!res.ok) return msg(data.erro || 'Não foi possível excluir.', 'erro');
    carregarProdutos();
  }
};

$('#formProduto').onsubmit = async (e) => {
  e.preventDefault();
  const id = $('#id').value;
  const payload = {
    nome: $('#nome').value.trim(),
    categoria: $('#categoria').value.trim().toLowerCase(),
    preco: Number($('#preco').value),
    estoque: Number($('#estoque').value),
    fab: isoParaBr($('#fab').value),
    val: isoParaBr($('#val').value),
    emoji: $('#emoji').value.trim() || $('#nome').value.trim()
  };
  try {
    const res = await fetch(id ? `/api/products/${id}` : '/api/products', {
      method: id ? 'PUT' : 'POST',
      headers: SB.headers(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return msg(data.erro || 'Não foi possível salvar o produto.', 'erro');
    msg(id ? 'Produto atualizado!' : 'Produto cadastrado!', 'ok');
    modoCriacao();
    carregarProdutos();
  } catch (_err) {
    msg('Servidor indisponível. Tente novamente.', 'erro');
  }
};

carregarPerfilMercado();
carregarProdutos();
