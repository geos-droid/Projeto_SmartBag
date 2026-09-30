const router = require('express').Router();
const crypto = require('crypto');
const { usuarios, sessoes } = require('../store');
const { exigirLogin } = require('../middleware/auth');

const hash = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const tokenNovo = () => crypto.randomBytes(24).toString('hex');
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Criar conta (Create)
router.post('/register', (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const telefone = String(req.body.telefone || '').trim();
  const senha = String(req.body.senha || '');
  const tipo = req.body.tipo === 'parceiro' ? 'parceiro' : 'consumidor';
  const mercado_nome = String(req.body.mercado_nome || '').trim();
  const mercado_local = String(req.body.mercado_local || '').trim();
  const mercado_logo = String(req.body.mercado_logo || '').trim();

  if (nome.length < 3) return res.status(400).json({ erro: 'Informe um nome com 3 letras ou mais.' });
  if (!emailValido(email)) return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  if (telefone.replace(/\D/g, '').length < 10) return res.status(400).json({ erro: 'Informe o telefone com DDD.' });
  if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter 6 caracteres ou mais.' });
  if (usuarios.porEmail(email)) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  if (tipo === 'parceiro' && mercado_nome.length < 3) return res.status(400).json({ erro: 'Informe o nome do mercado.' });
  if (tipo === 'parceiro' && mercado_local.length < 3) return res.status(400).json({ erro: 'Informe a localização do mercado.' });

  const user = usuarios.criar({ nome, email, telefone, tipo, senha_hash: hash(senha), ...(tipo === 'parceiro' ? { mercado_nome, mercado_local, mercado_logo } : {}) });
  res.status(201).json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo, ...(tipo === 'parceiro' ? { mercado_nome: user.mercado_nome, mercado_local: user.mercado_local, unidade_id: `UN-${String(user.id).padStart(3, '0')}` } : {}) });
});

// Login (Read + criação de sessão)
router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');
  const user = usuarios.porEmail(email);
  // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails existem
  if (!user || user.senha_hash !== hash(senha)) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  const token = tokenNovo();
  sessoes.criar(user.id, token);
  res.json({ token, nome: user.nome, email: user.email, tipo: user.tipo, id: user.id, ...(user.tipo === 'parceiro' ? { mercado_nome: user.mercado_nome, mercado_local: user.mercado_local, mercado_logo: user.mercado_logo || '', unidade_id: `UN-${String(user.id).padStart(3, '0')}` } : {}) });
});

router.post('/logout', exigirLogin, (req, res) => { sessoes.remover(req.token); res.json({ ok: true }); });

router.get('/me', exigirLogin, (req, res) => {
  const { senha_hash, ...dados } = req.usuario;
  res.json(dados);
});

// Editar perfil (Update)
router.put('/me', exigirLogin, (req, res) => {
  const nome = String(req.body.nome ?? req.usuario.nome).trim();
  const telefone = String(req.body.telefone ?? req.usuario.telefone).trim();
  if (nome.length < 3) return res.status(400).json({ erro: 'Informe um nome com 3 letras ou mais.' });
  if (telefone.replace(/\D/g, '').length < 10) return res.status(400).json({ erro: 'Informe o telefone com DDD.' });
  const atualizado = usuarios.atualizar(req.usuario.id, { nome, telefone });
  const { senha_hash, ...dados } = atualizado;
  res.json(dados);
});

// Perfil do mercado parceiro (Update)
router.put('/market', exigirLogin, (req, res) => {
  if (req.usuario.tipo !== 'parceiro') return res.status(403).json({ erro: 'Apenas contas parceiras possuem mercado.' });
  const mercado_nome = String(req.body.mercado_nome ?? req.usuario.mercado_nome ?? '').trim();
  const mercado_local = String(req.body.mercado_local ?? req.usuario.mercado_local ?? '').trim();
  const mercado_logo = String(req.body.mercado_logo ?? req.usuario.mercado_logo ?? '').trim();
  if (mercado_nome.length < 3) return res.status(400).json({ erro: 'Informe o nome do mercado.' });
  if (mercado_local.length < 3) return res.status(400).json({ erro: 'Informe a localização do mercado.' });
  const atualizado = usuarios.atualizar(req.usuario.id, { mercado_nome, mercado_local, mercado_logo });
  res.json({ mercado_nome: atualizado.mercado_nome, mercado_local: atualizado.mercado_local, mercado_logo: atualizado.mercado_logo || '', unidade_id: `UN-${String(atualizado.id).padStart(3, '0')}` });
});

// Excluir conta (Delete)
router.delete('/me', exigirLogin, (req, res) => {
  usuarios.remover(req.usuario.id);
  sessoes.remover(req.token);
  res.json({ ok: true });
});

module.exports = router;
