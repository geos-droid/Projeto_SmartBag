const router = require('express').Router();
const { usuarios } = require('../store');
router.get('/', (_req, res) => {
  const parceiros = usuarios.listar().filter((u) => u.tipo === 'parceiro' && u.mercado_nome);
  res.json([
    { id: null, nome: 'Smart Bag', unidade_id: 'OFICIAL', localizacao: 'Candeias-BA', logo: '/img/logo-.png', oficial: true },
    ...parceiros.map((u) => ({ id: u.id, nome: u.mercado_nome, unidade_id: `UN-${String(u.id).padStart(3, '0')}`, localizacao: u.mercado_local || 'Candeias-BA', logo: u.mercado_logo || '/img/logo-l.png', oficial: false }))
  ]);
});
module.exports = router;
