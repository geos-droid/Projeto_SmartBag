const router = require('express').Router();
const { mensagens } = require('../store');

router.post('/', (req, res) => {
  const assunto = String(req.body.assunto || '').trim() || 'Contato geral';
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim();
  const msg = String(req.body.msg || '').trim();
  if (nome.length < 3) return res.status(400).json({ erro: 'Informe seu nome (mínimo 3 letras).' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: 'Informe um e-mail válido, como nome@email.com.' });
  if (msg.length < 10) return res.status(400).json({ erro: 'Escreva uma mensagem com pelo menos 10 caracteres.' });
  const registro = mensagens.criar({ assunto, nome, email, msg });
  res.status(201).json({ ok: true, id: registro.id });
});

module.exports = router;
