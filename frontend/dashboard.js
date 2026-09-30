const $ = (id) => document.getElementById(id);
const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const carrinho = {};
let produtos = [];
let catalogo = [];
let categoriasCarregadas = false;
let lojas = [];
let lojaSelecionada = null;
const LOJA_CHAVE = 'sb_loja_selecionada';

const IMAGENS = {
  padaria: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&fm=webp&q=85&w=900',
  acougue: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&fm=webp&q=85&w=900',
  frios: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&fm=webp&q=85&w=900',
  bebidas: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&fm=webp&q=85&w=900',
  mercearia: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&fm=webp&q=85&w=900'
};

const IMAGENS_PRODUTOS = {
  'Pao integral Pullman': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Pao frances (kg)': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Bolo de fuba caseiro': 'https://www.cozinhaaz.com/wp-content/uploads/2020/01/bolo-de-fuba-2.jpg',
  'Torrada Bauducco': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Coxa e sobrecoxa de frango (kg)': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Patinho bovino moido (kg)': 'https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Linguica toscana (kg)': 'https://clubedacharcutaria.com.br/images/linguica-toscana.jpg',
  'File de tilapia (kg)': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Margarina Qualy 500g': 'https://down-br.img.susercontent.com/file/sg-11134201-7qvg7-lgu4v4elkttz6c',
  'Queijo mussarela fatiado 400g': 'https://www.sondadelivery.com.br/img.aspx/sku/1000037805/530/NovoProjeto-6-.jpg',
  'Presunto cozido fatiado 200g': 'https://lojazmart.com/media/catalog/product/cache/1/image/650x/040ec09b1e35df139433887a97daa66f/1/8/180764_06988-2_2048x.jpg',
  'Iogurte natural integral 900g': 'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750644310769L.jpg',
  'Leite integral UHT 1L': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Suco de uva integral 1L': 'https://redemix.vteximg.com.br/arquivos/ids/214476-1000-1000/7898942775314.jpg?v=638350626899700000',
  'Refrigerante cola 2L': 'https://cdn.shopify.com/s/files/1/1075/8388/products/um69ot2cRHKejyrU88Qi_Coke-Regular-2L-5449000009067.jpeg?v=1571305381',
  'Agua de coco 1L': 'https://lirp.cdn-website.com/7c4c3990/dms3rep/multi/opt/mockup+agua+de+coco+copiar-0808c76d-1920w.jpg',
  'Atum ralado Gomes da Costa': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Farinha de trigo Finna 1kg': 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Feijao carioca 1kg Kicaldo': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Oleo de soja Soya 1L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Arroz branco 1kg Camil': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Macarrao espaguete 500g': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&fm=webp&q=85&w=900',
  'Molho de tomate 340g': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&fm=webp&q=85&w=900'
};

const receitas = [
  {
    id: 'empadao',
    titulo: 'Empadão cremoso de frango',
    descricao: 'Massa douradinha com frango, queijo e um recheio bem cremoso.',
    imagem: 'https://i2.wp.com/s2.glbimg.com/-kp5aJQjf1kqwBOlWgwaLsrvqg8=/1200x/smart/filters:cover():strip_icc()/i.s3.glbimg.com/v1/AUTH_1f540e0b94d8437dbbc39d567a1dee68/internal_photos/bs/2022/S/g/htV48vSjyZQH34ndV7aQ/maxresdefault.jpg',
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
    imagem: 'https://www.guiadasemana.com.br/contentFiles/image/2017/05/FEA/principal/51266_w840h0_1493907179espaguete.jpg',
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
    imagem: 'https://img.elnueve.com.ar/sites/default/files/styles/2_1_max_1024px/public/2025-06/WhatsApp%20Image%202025-06-05%20at%2015.19.57%20%281%29.jpeg?h=a92f03cd&itok=EKngenTp',
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
    imagem: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&fm=webp&q=85&w=1000',
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
    imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&fm=webp&q=85&w=1000',
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
    imagem: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&fm=webp&q=85&w=1000',
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

function imagemProduto(p) {
  return IMAGENS_PRODUTOS[p.nome] || IMAGENS[p.categoria] || IMAGENS.mercearia;
}

function renderVitrine() {
  $('vitrine').innerHTML = produtos.length
    ? produtos.map((p) => `
   <article class="produto">
    <div class="img"><img src="${imagemProduto(p)}" alt="Foto real de alimentos da categoria ${p.categoria}" loading="lazy" decoding="async"></div>
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
  $('total').textContent = brl(ids.reduce((s, id) => {
    const p = produtoDoCatalogo(id);
    return s + (carrinho[id].marcado && p ? carrinho[id].qtd * p.preco : 0);
  }, 0));
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
    $('enderecoBox').hidden = entrega !== 'delivery';
  };
});

const abrir = () => { $('modal').classList.add('aberto'); $('enderecoBox').hidden = document.querySelector('input[name="entrega"]:checked').value !== 'delivery'; };
const fechar = () => $('modal').classList.remove('aberto');
$('abrirCarrinho').onclick = abrir;
$('voltar').onclick = fechar;
$('modal').onclick = (e) => { if (e.target.id === 'modal') fechar(); };

$('cep').addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  e.target.value = v;
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
  } catch (_err) {
    $('cepMsg').textContent = 'Não foi possível localizar o CEP.';
  }
};

$('finalizar').onclick = async () => {
  const marcados = Object.keys(carrinho).filter((id) => carrinho[id].marcado);
  if (!marcados.length) return aviso('Selecione ao menos um item para finalizar.');
  if (!SB.get()) { aviso('Faça login para finalizar a compra.'); return location.href = 'login.html'; }

  const pagamento = document.querySelector('input[name="pgto"]:checked').value;
  const entrega = document.querySelector('input[name="entrega"]:checked').value;
  const endereco = [
    $('logradouro').value.trim(),
    $('numero').value.trim() ? `nº ${$('numero').value.trim()}` : '',
    $('complemento').value.trim(),
    $('bairro').value.trim(),
    $('cidadeUf').value.trim(),
    $('cep').value.trim()
  ].filter(Boolean).join(', ');
  if (entrega === 'delivery' && endereco.length < 8) return aviso('Preencha o endereço de entrega ou busque pelo CEP.');

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: SB.headers(),
      body: JSON.stringify({
        pagamento, entrega, endereco,
        cep: $('cep').value.trim(),
        complemento: $('complemento').value.trim(),
        instrucoes_entrega: $('instrucoes').value.trim(),
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
       <span>${new Date(p.criado_em).toLocaleString('pt-BR')} · Total: ${brl(p.total)}</span>
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
