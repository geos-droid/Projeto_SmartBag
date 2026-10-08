const router = require('express').Router();
const { produtos, pedidos, ErroEstoque } = require('../store');
const { exigirLogin } = require('../middleware/auth');

const FRETES_8 = new Set(['areia','santo antonio','urbis ii','centro','nova candeias','triangulo','malemba']);
const FRETES_12 = new Set(['sarandy','distrito industrial','urbis i','nova brasilia','pitanga','area rural de candeias']);

function normalizarTexto(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function calcularFrete(bairro, cidadeUf) {
  const cidade = normalizarTexto(cidadeUf);
  const b = normalizarTexto(bairro);
  if (!cidade.includes('candeias') || !cidade.includes('/ ba')) return 0;
  if (FRETES_8.has(b)) return 8;
  if (FRETES_12.has(b)) return 12;
  return 0;
}

// Criar pedido (Create) — preço e estoque vêm sempre do banco, nunca do que o navegador envia
router.post('/', exigirLogin, (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const parceiro_id = req.body.parceiro_id === null || req.body.parceiro_id === '' || req.body.parceiro_id === undefined ? null : Number(req.body.parceiro_id);
  if (parceiro_id !== null && !Number.isInteger(parceiro_id)) return res.status(400).json({ erro: 'Loja inválida.' });
  const pagamento = String(req.body.pagamento || '');
  const entrega = String(req.body.entrega || '');
  const endereco = String(req.body.endereco || '').trim();
  const cep = String(req.body.cep || '').trim();
  const complemento = String(req.body.complemento || '').trim();
  const bairro = String(req.body.bairro || '').trim();
  const cidade_uf = String(req.body.cidade_uf || '').trim();
  const instrucoes_entrega = String(req.body.instrucoes_entrega || '').trim().slice(0, 250);
  const cartao = req.body.cartao && typeof req.body.cartao === 'object' ? req.body.cartao : null;
  if (!items.length) return res.status(400).json({ erro: 'Selecione ao menos um item para finalizar.' });
  if (!['pix', 'debito', 'credito'].includes(pagamento)) return res.status(400).json({ erro: 'Forma de pagamento inválida.' });
  if (!['retirada', 'delivery'].includes(entrega)) return res.status(400).json({ erro: 'Opção de entrega inválida.' });
  if (entrega === 'delivery' && endereco.length < 8) return res.status(400).json({ erro: 'Informe o endereço de entrega.' });

  if (['debito', 'credito'].includes(pagamento)) {
    if (!cartao || String(cartao.tipo) !== pagamento || !/^\d{4}$/.test(String(cartao.ultimos4 || ''))) {
      return res.status(400).json({ erro: 'Dados do cartão inválidos. Preencha o formulário do cartão.' });
    }
    if (pagamento === 'credito') {
      const parcelas = Number(cartao.parcelas);
      if (![1,2,3,4,5,6,8,10,12].includes(parcelas)) return res.status(400).json({ erro: 'Parcelamento inválido.' });
    }
  }

  const frete = entrega === 'delivery' ? calcularFrete(bairro, cidade_uf) : 0;
  if (entrega === 'delivery' && !frete) {
    return res.status(400).json({ erro: 'Bairro/região não atendido para delivery em Candeias-BA.' });
  }

  const detalhe = [];
  let total = 0;
  for (const item of items) {
    const produto = produtos.porId(item.id);
    if (!produto) return res.status(404).json({ erro: `Produto ${item.id} não encontrado.` });
    if ((produto.parceiro_id ?? null) !== parceiro_id) return res.status(409).json({ erro: 'Todos os itens do pedido precisam pertencer à mesma loja selecionada.' });
    const qtd = Math.max(1, Number(item.qtd) || 1);
    total += produto.preco * qtd;
    detalhe.push({ id: produto.id, nome: produto.nome, preco: produto.preco, qtd });
  }
  try {
    produtos.baixarEstoque(detalhe.map((d) => [d.id, d.qtd]));
  } catch (e) {
    if (e instanceof ErroEstoque) return res.status(409).json({ erro: e.message });
    throw e;
  }
  const pedido = pedidos.criar({
    user_id: req.usuario.id,
    items: detalhe,
    pagamento,
    entrega,
    endereco: entrega === 'delivery' ? endereco : null,
    cep: entrega === 'delivery' ? cep : null,
    complemento: entrega === 'delivery' ? complemento : null,
    instrucoes_entrega: entrega === 'delivery' ? instrucoes_entrega : null,
    bairro: entrega === 'delivery' ? bairro : null,
    cidade_uf: entrega === 'delivery' ? cidade_uf : null,
    cartao: ['debito','credito'].includes(pagamento) ? {
      tipo: cartao.tipo,
      ultimos4: String(cartao.ultimos4),
      parcelas: Number(cartao.parcelas || 1)
    } : null,
    subtotal: Number(total.toFixed(2)),
    frete: Number(frete.toFixed(2)),
    total: Number((total + frete).toFixed(2)),
    parceiro_id,
    mercado_nome: parceiro_id === null ? 'Smart Bag' : (req.body.mercado_nome || null),
    unidade_id: parceiro_id === null ? 'OFICIAL' : (req.body.unidade_id || null)
  });
  res.status(201).json(pedido);
});

// Histórico do usuário logado (Read)
router.get('/', exigirLogin, (req, res) => {
  res.json(pedidos.listarDoUsuario(req.usuario.id));
});

// Cancelar pedido (Delete lógico: status vira "cancelado" e o estoque volta)
router.delete('/:id', exigirLogin, (req, res) => {
  const pedido = pedidos.cancelar(req.params.id, req.usuario.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado ou já cancelado.' });
  pedido.items.forEach((it) => produtos.repor(it.id, it.qtd));
  res.json(pedido);
});

module.exports = router;
