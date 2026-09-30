// Le o token "Bearer" enviado pelo front e busca a sessão/usuário correspondente.
const { sessoes, usuarios } = require('../store');

function usuarioDaSessao(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const sessao = sessoes.porToken(token);
  if (!sessao) return null;
  return usuarios.porId(sessao.user_id);
}

// Bloqueia a rota (401) se não houver sessão válida; disponibiliza req.usuario e req.token
function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const usuario = usuarioDaSessao(req);
  if (!usuario) return res.status(401).json({ erro: 'Faça login para continuar.' });
  req.usuario = usuario;
  req.token = token;
  next();
}

// Além de logado, precisa ser do tipo "parceiro" (loja cadastrada)
function exigirParceiro(req, res, next) {
  exigirLogin(req, res, () => {
    if (req.usuario.tipo !== 'parceiro') return res.status(403).json({ erro: 'Área exclusiva para parceiros.' });
    next();
  });
}

module.exports = { usuarioDaSessao, exigirLogin, exigirParceiro };
