const router = require('express').Router();
const { produtos } = require('../store');
const { exigirParceiro } = require('../middleware/auth');

// Catálogo público (Read) — só ativos, com estoque e dentro da validade
router.get('/', (req, res) => {
  const parceiroId = req.query.parceiro_id === undefined || req.query.parceiro_id === '' ? null : Number(req.query.parceiro_id);
  if (req.query.parceiro_id !== undefined && req.query.parceiro_id !== '' && !Number.isInteger(parceiroId)) return res.status(400).json({ erro: 'Loja inválida.' });
  res.json(produtos.listarPublico({ q: req.query.q, categoria: req.query.categoria, parceiroId }));
});

// Produtos do parceiro logado, para gerenciar (inclui vencidos/zerados)
router.get('/mine', exigirParceiro, (req, res) => {
  res.json(produtos.listarDoParceiro(req.usuario.id));
});

router.get('/:id', (req, res) => {
  const p = produtos.porId(req.params.id);
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(p);
});

function validar(body) {
  const nome = String(body.nome || '').trim();
  const categoria = String(body.categoria || '').trim();
  const preco = Number(body.preco);
  const estoque = Number(body.estoque);
  const fab = String(body.fab || '').trim();
  const val = String(body.val || '').trim();
  const dataOk = /^\d{2}\/\d{2}\/\d{2}$/;
  if (nome.length < 3) return 'Informe um nome com 3 letras ou mais.';
  if (!categoria) return 'Escolha uma categoria.';
  if (!Number.isFinite(preco) || preco <= 0) return 'Informe um preço válido, maior que zero.';
  if (!Number.isInteger(estoque) || estoque < 0) return 'Informe um estoque válido (0 ou mais).';
  if (!dataOk.test(fab) || !dataOk.test(val)) return 'Informe as datas no formato dd/mm/aa.';
  return null;
}

// Cadastrar produto (Create) — só parceiro logado, dono automaticamente
router.post('/', exigirParceiro, (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  const { nome, categoria, preco, estoque, fab, val, emoji } = req.body;
  const p = produtos.criar({
    nome: nome.trim(), categoria: categoria.trim(), preco: Number(preco), estoque: Number(estoque),
    fab: fab.trim(), val: val.trim(), emoji: String(emoji || nome).trim().slice(0, 24), parceiro_id: req.usuario.id
  });
  res.status(201).json(p);
});

// Editar produto (Update) — só o parceiro dono
router.put('/:id', exigirParceiro, (req, res) => {
  const p = produtos.porId(req.params.id);
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
  if (p.parceiro_id !== req.usuario.id) return res.status(403).json({ erro: 'Este produto não pertence a você.' });
  const erro = validar({ ...p, ...req.body });
  if (erro) return res.status(400).json({ erro });
  const { nome, categoria, preco, estoque, fab, val, emoji, ativo } = req.body;
  const atualizado = produtos.atualizar(p.id, {
    nome: String(nome).trim(), categoria: String(categoria).trim(), preco: Number(preco), estoque: Number(estoque),
    fab: String(fab).trim(), val: String(val).trim(), emoji: String(emoji || nome).trim().slice(0, 24),
    ativo: ativo !== undefined ? !!ativo : p.ativo
  });
  res.json(atualizado);
});

// Excluir produto (Delete) — só o parceiro dono
router.delete('/:id', exigirParceiro, (req, res) => {
  const p = produtos.porId(req.params.id);
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
  if (p.parceiro_id !== req.usuario.id) return res.status(403).json({ erro: 'Este produto não pertence a você.' });
  produtos.remover(p.id);
  res.json({ ok: true });
});

module.exports = router;
