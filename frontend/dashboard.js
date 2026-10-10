const $ = (id) => document.getElementById(id);
const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const carrinho = {};
let produtos = [];
let catalogo = [];
let categoriasCarregadas = false;
let lojas = [];
let lojaSelecionada = null;
const LOJA_CHAVE = 'sb_loja_selecionada';
let freteAtual = 0;

const FRETES_CENTRAL = new Set([
  'areia','santo antonio','urbis ii','centro','nova candeias','triangulo','malemba'
]);
const FRETES_12 = new Set([
  'sarandy','distrito industrial','urbis i','nova brasilia','pitanga','area rural de candeias'
]);

const IMAGEM_NEUTRA = 'assets/images/products/_sem-imagem.svg';

// Imagens locais: o catálogo usa fotos reais em `database/data.json`.
// Todos os 24 produtos já têm foto local — nenhum SVG ilustrativo pendente.
const LOCAL_IMAGENS_PRODUTOS = {};

const receitas = [
  {
    id: 'empadao',
    titulo: 'Empadão cremoso de frango',
    descricao: 'Massa douradinha com frango, queijo e um recheio bem cremoso.',
    imagem: 'assets/images/receitas/empadao.jpg',
    ingredientes: [
      { id: 19, qtd: 1, medida: '1 pacote de 1 kg' },
      { id: 9, qtd: 1, medida: '1 pote de 500 g' },
      { id: 5, qtd: 1, medida: '1 kg' },
      { id: 10, qtd: 1, medida: '1 pacote de 400 g' },
      { id: 21, qtd: 1, medida: '1 garrafa de 1 L' }
    ]
  },
  {
    id: 'macarrao-carne',
    titulo: 'Macarrão com carne e molho',
    descricao: 'Almoço rápido usando macarrão, carne moída e molho de tomate da loja.',
    imagem: 'assets/images/receitas/macarrao-carne.jpg',
    ingredientes: [
      { id: 23, qtd: 1, medida: '1 pacote de 500 g' },
      { id: 6, qtd: 1, medida: '500 g de carne moída' },
      { id: 24, qtd: 1, medida: '1 sachê de 340 g' },
      { id: 21, qtd: 1, medida: 'a gosto' },
      { id: 10, qtd: 1, medida: '1 pacote de 400 g' }
    ]
  },
  {
    id: 'arroz-frango',
    titulo: 'Arroz cremoso de frango',
    descricao: 'Uma receita prática para o almoço com arroz, frango, molho e queijo.',
    imagem: 'assets/images/receitas/arroz-frango.jpg',
    ingredientes: [
      { id: 22, qtd: 1, medida: '1 pacote de 1 kg' },
      { id: 5, qtd: 1, medida: '1 kg' },
      { id: 24, qtd: 1, medida: '1 sachê de 340 g' },
      { id: 10, qtd: 1, medida: '1 pacote de 400 g' }
    ]
  },
  {
    id: 'sanduiche',
    titulo: 'Sanduíche de presunto e queijo',
    descricao: 'Lanche simples e rápido feito com produtos da padaria e da seção de frios.',
    imagem: 'assets/images/receitas/sanduiche.jpg',
    ingredientes: [
      { id: 1, qtd: 1, medida: '1 pacote de pão integral' },
      { id: 11, qtd: 1, medida: '1 pacote de 200 g' },
      { id: 10, qtd: 1, medida: '1 pacote de 400 g' },
      { id: 9, qtd: 1, medida: '1 pote de 500 g' }
    ]
  },
  {
    id: 'atum',
    titulo: 'Patê cremoso de atum',
    descricao: 'Opção prática para acompanhar pães e torradas, com ingredientes encontrados na Smart Bag.',
    imagem: 'assets/images/receitas/atum.jpg',
    ingredientes: [
      { id: 18, qtd: 1, medida: '1 lata' },
      { id: 9, qtd: 1, medida: '1 pote de 500 g' },
      { id: 4, qtd: 1, medida: '1 pacote' },
      { id: 1, qtd: 1, medida: '1 pacote' }
    ]
  },
  {
    id: 'feijao-arroz',
    titulo: 'Arroz com feijão do dia a dia',
    descricao: 'Combinação clássica para montar uma refeição completa com itens da mercearia.',
    imagem: 'assets/images/receitas/feijao-arroz.jpg',
    ingredientes: [
      { id: 22, qtd: 1, medida: '1 pacote de 1 kg' },
      { id: 20, qtd: 1, medida: '1 pacote de 1 kg' },
      { id: 21, qtd: 1, medida: '1 garrafa de 1 L' }
    ]
  }
];

function lojaAtual() { return lojas.find((l) => (l.id ?? null) === lojaSelecionada) || lojas.find((l) => l.id === null) || lojas[0]; }
function salvarLojaAtual() { localStorage.setItem(LOJA_CHAVE, lojaSelecionada === null ? 'oficial' : String(lojaSelecionada)); }
function atualizarCabecalhoLoja() { const loja = lojaAtual(); if (!loja) return; $('lojaNome').textContent = loja.nome; $('lojaMeta').textContent = `Comprando em: ${loja.unidade_id} · ${loja.localizacao}`; $('lojaLogo').src = loja.logo || '/img/logo-l.png'; }
async function carregarLojas() {
  try { const res = await fetch('/api/markets'); lojas = await res.json(); } catch { lojas = [{ id:null,nome:'Smart Bag',unidade_id:'OFICIAL',localizacao:'Candeias-BA',logo:'/img/logo-.png' }]; }
  const salvo = localStorage.getItem(LOJA_CHAVE); lojaSelecionada = salvo && salvo !== 'oficial' ? Number(salvo) : null;
  if (!lojas.some((l) => (l.id ?? null) === lojaSelecionada)) lojaSelecionada = null;
  $('lojaSelect').innerHTML = lojas.map((l) => `<option value="${l.id === null ? 'oficial' : l.id}">${l.nome} · ${l.unidade_id}</option>`).join('');
  $('lojaSelect').value = lojaSelecionada === null ? 'oficial' : String(lojaSelecionada); atualizarCabecalhoLoja();
}
async function trocarLoja(valor) {
  const nova = valor === 'oficial' ? null : Number(valor);
  if (Object.keys(carrinho).length && nova !== lojaSelecionada) {
    if (!confirm('Trocar de loja vai limpar o carrinho atual. Deseja continuar?')) { $('lojaSelect').value = lojaSelecionada === null ? 'oficial' : String(lojaSelecionada); return; }
    Object.keys(carrinho).forEach((k) => delete carrinho[k]); atualizar();
  }
  lojaSelecionada = nova; salvarLojaAtual(); atualizarCabecalhoLoja(); categoriasCarregadas = false; await carregarCatalogo();
}

function aviso(txt) {
  const t = $('toast');
  t.textContent = txt;
  t.classList.add('mostra');
  clearTimeout(t.h);
  t.h = setTimeout(() => t.classList.remove('mostra'), 2800);
}

function atualizarContaBtn() {
  const s = SB.get();
  const btn = $('contaBtn');
  const sair = $('sairBtn');
  if (s && s.nome) {
    btn.textContent = s.nome.split(' ')[0];
    btn.href = 'conta.html';
    sair.hidden = false;
    sair.onclick = async () => { await SB.logout(); location.href = 'index.html'; };
  } else {
    btn.textContent = 'Minha Conta';
    btn.href = 'login.html';
    sair.hidden = true;
  }
}

const escAttr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Ordem: arquivo local do catálogo -> URL de origem -> SVG local antigo -> imagem neutra.
function imagemProduto(p) {
  return p.imagem || p.imagem_origem || LOCAL_IMAGENS_PRODUTOS[p.nome] || IMAGEM_NEUTRA;
}

// Fallbacks encadeados usados no onerror do <img>.
function fallbacksImagem(p) {
  const atual = imagemProduto(p);
  return [p.imagem_origem, LOCAL_IMAGENS_PRODUTOS[p.nome], IMAGEM_NEUTRA]
    .filter((u, i, a) => u && u !== atual && a.indexOf(u) === i);
}

function trocarImagem(img) {
  const lista = JSON.parse(img.dataset.fallbacks || '[]');
  const prox = lista.shift();
  if (!prox) { img.onerror = null; return; }
  img.dataset.fallbacks = JSON.stringify(lista);
  img.src = prox;
}
window.trocarImagem = trocarImagem;

function renderVitrine() {
  $('vitrine').innerHTML = produtos.length
    ? produtos.map((p) => `
   <article class="produto">
    <div class="img"><img src="${escAttr(imagemProduto(p))}" alt="${escAttr(p.nome)}" loading="lazy" decoding="async" data-fallbacks='${escAttr(JSON.stringify(fallbacksImagem(p)))}' onerror="trocarImagem(this)"></div>
    <span class="categoria-badge">${p.categoria}</span>
    <h4>${p.nome}</h4>
    <div class="preco">${brl(p.preco)}</div>
    <span class="badge">Val.: ${p.val} · ${p.estoque} un.</span>
    <button class="add" data-id="${p.id}">Adicionar ao carrinho</button>
   </article>`).join('')
    : '<p>Nenhum produto encontrado.</p>';
}

async function carregarCatalogo() {
  try {
    const res = await fetch(`/api/products?parceiro_id=${lojaSelecionada === null ? '' : lojaSelecionada}`);
    catalogo = await res.json();
  } catch (_err) {
    catalogo = [];
    aviso('Não foi possível carregar os produtos. Verifique sua conexão.');
  }
  if (!categoriasCarregadas) {
    const cats = [...new Set(catalogo.map((p) => p.categoria))].sort();
    $('categoria').innerHTML = '<option value="">Todas as categorias</option>' +
      cats.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join('');
    categoriasCarregadas = true;
  }
  aplicarFiltros();
  if (document.body.classList.contains('modo-receitas')) renderReceitas();
}

function aplicarFiltros() {
  const q = $('busca').value.trim().toLowerCase();
  const categoria = $('categoria').value;
  produtos = catalogo.filter((p) => {
    const texto = `${p.nome} ${p.categoria}`.toLowerCase();
    return (!q || texto.includes(q)) && (!categoria || p.categoria === categoria);
  });
  renderVitrine();
}

function mostrarProdutos() {
  document.body.classList.remove('modo-receitas');
  $('receitasView').hidden = true;
  $('vitrine').hidden = false;
  $('busca').hidden = false;
  $('categoria').hidden = false;
  aplicarFiltros();
  $('sidebar').classList.remove('aberto');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarReceitas() {
  document.body.classList.add('modo-receitas');
  $('vitrine').hidden = true;
  $('receitasView').hidden = false;
  $('busca').hidden = true;
  $('categoria').hidden = true;
  renderReceitas();
  $('sidebar').classList.remove('aberto');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function produtoDoCatalogo(id) {
  return catalogo.find((p) => p.id === Number(id));
}

function renderReceitas() {
  if (!catalogo.length) {
    $('receitasGrid').innerHTML = '<p class="receitas-vazio">Carregando os produtos da loja...</p>';
    return;
  }

  $('receitasGrid').innerHTML = receitas.map((r) => {
    const ingredientesDisponiveis = r.ingredientes.filter((i) => {
      const p = produtoDoCatalogo(i.id);
      return p && p.estoque >= i.qtd;
    });

    return `
      <article class="receita-card">
        <div class="receita-capa">
          <img src="${r.imagem}" alt="${r.titulo}" loading="lazy" decoding="async">
        </div>
        <div class="receita-corpo">
          <h2>${r.titulo}</h2>
          <p>${r.descricao}</p>
          <div class="receita-info"><span>${r.ingredientes.length} ingredientes</span><span>${ingredientesDisponiveis.length} disponíveis na loja</span></div>
          <h3>Ingredientes</h3>
          <div class="ingredientes">
            ${r.ingredientes.map((i) => {
              const p = produtoDoCatalogo(i.id);
              const disponivel = p && p.estoque >= i.qtd;
              return `<div class="ingrediente ${disponivel ? '' : 'indisponivel'}">
                <div class="ingrediente-info">
                  <strong>${p ? p.nome : 'Produto não encontrado'}</strong>
                  <small>${i.medida}${p ? ` · ${brl(p.preco)}` : ''}</small>
                </div>
                ${disponivel
                  ? `<button type="button" class="add-ingrediente" data-id="${i.id}" data-qtd="${i.qtd}" aria-label="Adicionar ${p.nome} ao carrinho">Adicionar ao carrinho</button>`
                  : `<span class="sem-estoque">Indisponível</span>`}
              </div>`;
            }).join('')}
          </div>
          <button type="button" class="add-todos" data-todos-receita="${r.id}">Adicionar todos os ingredientes disponíveis</button>
        </div>
      </article>`;
  }).join('');
}

function adicionarAoCarrinho(id, qtd = 1) {
  const p = produtoDoCatalogo(id);
  if (!p) return aviso('Produto não encontrado.');
  const c = carrinho[id] = carrinho[id] || { qtd: 0, marcado: true };
  if (c.qtd + qtd > p.estoque) return aviso(`Estoque máximo de "${p.nome}" atingido.`);
  c.qtd += qtd;
  atualizar();
  aviso(`${p.nome} adicionado ao carrinho.`);
}

$('vitrine').onclick = (e) => {
  const id = e.target.dataset.id;
  if (id) adicionarAoCarrinho(Number(id));
};

$('receitasGrid').onclick = (e) => {
  const id = e.target.dataset.id;
  const qtd = Number(e.target.dataset.qtd || 1);
  if (id) return adicionarAoCarrinho(Number(id), qtd);

  const receitaId = e.target.dataset.todosReceita;
  if (receitaId) {
    const r = receitas.find((x) => x.id === receitaId);
    let adicionados = 0;
    r.ingredientes.forEach((i) => {
      const p = produtoDoCatalogo(i.id);
      if (p && p.estoque >= i.qtd) {
        const c = carrinho[i.id] = carrinho[i.id] || { qtd: 0, marcado: true };
        if (c.qtd + i.qtd <= p.estoque) { c.qtd += i.qtd; adicionados++; }
      }
    });
    atualizar();
    aviso(adicionados ? `${adicionados} ingredientes adicionados ao carrinho.` : 'Nenhum ingrediente disponível para adicionar.');
  }
};

function subtotalSelecionado() {
  return Object.keys(carrinho).reduce((s, id) => {
    const p = produtoDoCatalogo(id);
    return s + (carrinho[id].marcado && p ? carrinho[id].qtd * p.preco : 0);
  }, 0);
}

function normalizarTexto(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function calcularFretePorBairro(bairro) {
  const b = normalizarTexto(bairro);
  if (FRETES_CENTRAL.has(b)) return 8;
  if (FRETES_12.has(b)) return 12;
  return 0;
}

function atualizarFrete() {
  const entrega = document.querySelector('input[name="entrega"]:checked')?.value;
  if (entrega !== 'delivery') {
    freteAtual = 0;
  } else {
    freteAtual = calcularFretePorBairro($('bairro').value);
  }
  const subtotal = subtotalSelecionado();
  $('subtotal').textContent = brl(subtotal);
  $('frete').textContent = freteAtual ? brl(freteAtual) : 'A calcular';
  $('total').textContent = brl(subtotal + freteAtual);
  $('freteMsg').textContent = freteAtual
    ? `Taxa de entrega para ${$('bairro').value.trim()}: ${brl(freteAtual)}.`
    : 'Informe um bairro de Candeias-BA para calcular a taxa.';
}

function atualizar() {
  const ids = Object.keys(carrinho);
  $('contador').textContent = ids.length;
  $('tituloCarrinho').textContent = `Carrinho (${ids.length})`;
  $('itens').innerHTML = ids.length
    ? ids.map((id) => {
      const p = produtoDoCatalogo(id);
      const c = carrinho[id];
      return `<div class="item">
        <input type="checkbox" data-marca="${id}" ${c.marcado ? 'checked' : ''} aria-label="Selecionar ${p?.nome || 'produto'}">
        <div class="nome">${p?.nome || 'Produto'}<br><small>${p ? brl(p.preco) : ''}</small></div>
        <div class="qtd"><button data-menos="${id}" aria-label="Diminuir">-</button>${c.qtd} und<button data-mais="${id}" aria-label="Aumentar">+</button></div>
      </div>`;
    }).join('')
    : '<p class="vazio">Seu carrinho está vazio. Adicione produtos na vitrine ou em uma receita.</p>';
  $('todos').checked = ids.length > 0 && ids.every((id) => carrinho[id].marcado);
  atualizarFrete();
}

$('itens').onclick = (e) => {
  const d = e.target.dataset;
  if (d.mais) adicionarAoCarrinho(Number(d.mais));
  if (d.menos) {
    const c = carrinho[d.menos];
    if (c && --c.qtd <= 0) delete carrinho[d.menos];
    atualizar();
  }
};
$('itens').onchange = (e) => {
  const id = e.target.dataset.marca;
  if (id) { carrinho[id].marcado = e.target.checked; atualizar(); }
};
$('todos').onchange = (e) => {
  Object.values(carrinho).forEach((c) => { c.marcado = e.target.checked; });
  atualizar();
};

document.querySelectorAll('.opcoes').forEach((g) => {
  g.onchange = () => {
    g.querySelectorAll('.opcao').forEach((o) => o.classList.toggle('sel', o.querySelector('input').checked));
    const entrega = document.querySelector('input[name="entrega"]:checked')?.value;
    const pagamento = document.querySelector('input[name="pgto"]:checked')?.value;
    $('enderecoBox').hidden = entrega !== 'delivery';
    $('cartaoBox').hidden = !['debito', 'credito'].includes(pagamento);
    $('parcelasField').hidden = pagamento !== 'credito';
    atualizarFrete();
  };
});

const abrir = () => { $('modal').classList.add('aberto'); $('enderecoBox').hidden = document.querySelector('input[name="entrega"]:checked').value !== 'delivery'; };
const fechar = () => $('modal').classList.remove('aberto');
$('abrirCarrinho').onclick = abrir;
$('voltar').onclick = fechar;
$('modal').onclick = (e) => { if (e.target.id === 'modal') fechar(); };

function aplicarFreteAutomaticamente() {
  if (document.querySelector('input[name="entrega"]:checked')?.value !== 'delivery') return;
  const cidade = normalizarTexto($('cidadeUf').value);
  const bairro = $('bairro').value.trim();
  if (cidade && !cidade.includes('candeias') && cidade.includes('/ ba')) {
    freteAtual = 0;
    $('freteMsg').textContent = 'A taxa automática está disponível para Candeias-BA.';
    atualizarFrete();
  } else {
    freteAtual = calcularFretePorBairro(bairro);
    atualizarFrete();
  }
}

$('cep').addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  e.target.value = v;
});
$('bairro').addEventListener('input', aplicarFreteAutomaticamente);
$('cidadeUf').addEventListener('input', aplicarFreteAutomaticamente);
$('cep').addEventListener('blur', () => {
  if ($('cep').value.replace(/\D/g, '').length === 8) $('buscarCep').click();
});

$('buscarCep').onclick = async () => {
  const cep = $('cep').value.replace(/\D/g, '');
  if (cep.length !== 8) { $('cepMsg').textContent = 'Digite um CEP válido com 8 números.'; return; }
  $('cepMsg').textContent = 'Buscando...';
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) throw new Error('CEP não encontrado');
    $('logradouro').value = data.logradouro || '';
    $('bairro').value = data.bairro || '';
    $('cidadeUf').value = `${data.localidade || ''} / ${data.uf || ''}`;
    $('cepMsg').textContent = 'CEP encontrado.';
    aplicarFreteAutomaticamente();
  } catch (_err) {
    $('cepMsg').textContent = 'Não foi possível localizar o CEP.';
  }
};

function validarCartao() {
  const numero = $('numeroCartao').value.replace(/\D/g, '');
  const nome = $('nomeCartao').value.trim();
  const validade = $('validadeCartao').value.trim();
  const cvv = $('cvvCartao').value.replace(/\D/g, '');
  const pagamento = document.querySelector('input[name="pgto"]:checked').value;

  if (!['debito', 'credito'].includes(pagamento)) return { ok: true };

  if (!/^\d{13,19}$/.test(numero) || !luhnValido(numero)) return { ok: false, msg: 'Confira o número do cartão.' };
  if (nome.length < 3) return { ok: false, msg: 'Informe o nome impresso no cartão.' };
  if (!/^((0[1-9])|(1[0-2]))\/\d{2}$/.test(validade)) return { ok: false, msg: 'Informe a validade no formato MM/AA.' };

  const [mes, ano] = validade.split('/').map(Number);
  const expira = new Date(2000 + ano, mes, 0, 23, 59, 59);
  if (expira < new Date()) return { ok: false, msg: 'O cartão informado está vencido.' };
  if (!/^\d{3,4}$/.test(cvv)) return { ok: false, msg: 'Informe um CVV válido.' };

  const parcelas = pagamento === 'credito' ? Number($('parcelas').value) : 1;
  return { ok: true, meta: { tipo: pagamento, ultimos4: numero.slice(-4), parcelas, nome: nome.slice(0, 80) } };
}

function luhnValido(numero) {
  let soma = 0, dobrar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let n = Number(numero[i]);
    if (dobrar) { n *= 2; if (n > 9) n -= 9; }
    soma += n;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

$('numeroCartao').addEventListener('input', (e) => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 19);
  e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
});
$('validadeCartao').addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
  e.target.value = v;
});
$('cvvCartao').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

$('finalizar').onclick = async () => {
  const marcados = Object.keys(carrinho).filter((id) => carrinho[id].marcado);
  if (!marcados.length) return aviso('Selecione ao menos um item para finalizar.');
  if (!SB.get()) { aviso('Faça login para finalizar a compra.'); return location.href = 'login.html'; }

  const pagamento = document.querySelector('input[name="pgto"]:checked').value;
  const entrega = document.querySelector('input[name="entrega"]:checked').value;
  const bairro = $('bairro').value.trim();
  const endereco = [
    $('logradouro').value.trim(),
    $('numero').value.trim() ? `nº ${$('numero').value.trim()}` : '',
    $('complemento').value.trim(),
    bairro,
    $('cidadeUf').value.trim(),
    $('cep').value.trim()
  ].filter(Boolean).join(', ');

  if (entrega === 'delivery' && endereco.length < 8) return aviso('Preencha o endereço de entrega ou busque pelo CEP.');
  if (entrega === 'delivery') {
    const cidade = normalizarTexto($('cidadeUf').value);
    if (!cidade.includes('candeias') || !cidade.includes('/ ba')) return aviso('A entrega automática está disponível somente para Candeias-BA.');
    if (!calcularFretePorBairro(bairro)) return aviso('Informe um bairro/região de Candeias-BA atendido para calcular o frete.');
  }

  const cartao = validarCartao();
  if (!cartao.ok) return aviso(cartao.msg);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: SB.headers(),
      body: JSON.stringify({
        pagamento, entrega, endereco,
        cep: $('cep').value.trim(),
        bairro,
        cidade_uf: $('cidadeUf').value.trim(),
        complemento: $('complemento').value.trim(),
        instrucoes_entrega: $('instrucoes').value.trim(),
        cartao: cartao.meta || null,
        items: marcados.map((id) => ({ id: Number(id), qtd: carrinho[id].qtd }))
      })
    });
    const data = await res.json();
    if (res.status === 401) { aviso('Sua sessão expirou. Faça login novamente.'); return location.href = 'login.html'; }
    if (!res.ok) return aviso(data.erro || 'Não foi possível finalizar.');
    marcados.forEach((id) => delete carrinho[id]);
    atualizar();
    fechar();
    aviso(`Pedido #${data.id} confirmado! Total: ${brl(data.total)}`);
    await carregarCatalogo();
  } catch (_err) {
    aviso('Servidor indisponível. Tente novamente.');
  }
};

async function carregarPedidos() {
  if (!SB.get()) { aviso('Faça login para ver seus pedidos.'); return location.href = 'login.html'; }
  $('listaPedidos').innerHTML = 'Carregando...';
  try {
    const res = await fetch('/api/orders', { headers: SB.headers() });
    if (res.status === 401) { aviso('Sua sessão expirou. Faça login novamente.'); return location.href = 'login.html'; }
    const lista = await res.json();
    $('listaPedidos').innerHTML = lista.length ? lista.map((p) => `
     <div class="pedido">
      <div class="cab"><span>Pedido #${p.id}</span><span class="status ${p.status}">${p.status}</span></div>
      <div class="pedido-loja">${p.mercado_nome || 'Smart Bag'} · ${p.unidade_id || 'OFICIAL'}</div>
      <ul>${p.items.map((i) => `<li>${i.qtd}x ${i.nome} — ${brl(i.preco * i.qtd)}</li>`).join('')}</ul>
      ${p.entrega === 'delivery' && p.endereco ? `<small class="pedido-endereco">Entrega: ${p.endereco}</small>` : ''}
      <div class="rodapePedido">
       <span>${new Date(p.criado_em).toLocaleString('pt-BR')} · ${p.frete ? `Frete: ${brl(p.frete)} · ` : ''}Total: ${brl(p.total)}</span>
       ${p.status === 'confirmado' ? `<button class="cancelar" data-cancelar="${p.id}">Cancelar pedido</button>` : ''}
      </div>
     </div>`).join('') : '<p class="vazio-pedidos">Você ainda não fez nenhum pedido.</p>';
  } catch (_err) {
    $('listaPedidos').innerHTML = '<p class="vazio-pedidos">Não foi possível carregar seus pedidos.</p>';
  }
}
$('listaPedidos').onclick = async (e) => {
  const id = e.target.dataset.cancelar;
  if (!id) return;
  if (!confirm('Cancelar este pedido? O estoque será devolvido.')) return;
  try {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE', headers: SB.headers() });
    const data = await res.json();
    if (!res.ok) return aviso(data.erro || 'Não foi possível cancelar.');
    aviso('Pedido cancelado.');
    carregarPedidos();
    carregarCatalogo();
  } catch (_err) {
    aviso('Servidor indisponível. Tente novamente.');
  }
};
$('abrirPedidos').onclick = () => { $('modalPedidos').classList.add('aberto'); carregarPedidos(); };
$('fecharPedidos').onclick = () => $('modalPedidos').classList.remove('aberto');
$('modalPedidos').onclick = (e) => { if (e.target.id === 'modalPedidos') $('modalPedidos').classList.remove('aberto'); };

$('menuBtn').onclick = () => $('sidebar').classList.toggle('aberto');
$('temaBtn').onclick = () => SB.alternarTema();

document.querySelectorAll('.categoria-tab[data-cat]').forEach((tab) => {
  tab.onclick = () => {
    document.querySelectorAll('.categoria-tab').forEach((item) => item.classList.remove('ativo'));
    tab.classList.add('ativo');
    $('categoria').value = tab.dataset.cat;
    mostrarProdutos();
  };
});
$('abrirReceitasMenu').onclick = (e) => {
  e.preventDefault();
  document.querySelectorAll('.categoria-tab').forEach((item) => item.classList.remove('ativo'));
  $('abrirReceitasMenu').classList.add('ativo');
  mostrarReceitas();
};
$('voltarProdutos').onclick = mostrarProdutos;
$('busca').oninput = aplicarFiltros;
$('categoria').onchange = aplicarFiltros;

atualizarContaBtn();
$('lojaSelect').onchange = (e) => trocarLoja(e.target.value);
carregarLojas().then(carregarCatalogo);
atualizar();
if (location.hash === '#receitas') mostrarReceitas();
