// Camada de acesso a dados. Guarda tudo em database/data.json (um "banco" em arquivo),
// mas cada função aqui representa a mesma operação que uma tabela SQL faria
// (ver database/schema.sql para o modelo relacional equivalente).
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../database/data.json');

function ler() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}
function salvar(db) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
}
function novoId(lista) {
  return lista.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

// dd/mm/aa -> Date (assume 20aa). Usado para comparar com a data de hoje.
function dataBrParaDate(str) {
  const [d, m, a] = String(str).split('/').map(Number);
  return new Date(2000 + a, (m || 1) - 1, d || 1);
}
function hojeSemHora() {
  const h = new Date();
  return new Date(h.getFullYear(), h.getMonth(), h.getDate());
}
function dentroDaValidade(produto) {
  return dataBrParaDate(produto.val) >= hojeSemHora();
}

// ---------- usuários ----------
const usuarios = {
  listar: () => ler().users,
  porEmail: (email) => ler().users.find((u) => u.email === email) || null,
  porId: (id) => ler().users.find((u) => u.id === Number(id)) || null,
  criar(dados) {
    const db = ler();
    const user = { id: novoId(db.users), criado_em: new Date().toISOString(), ...dados };
    db.users.push(user);
    salvar(db);
    return user;
  },
  atualizar(id, dados) {
    const db = ler();
    const u = db.users.find((x) => x.id === Number(id));
    if (!u) return null;
    Object.assign(u, dados);
    salvar(db);
    return u;
  },
  remover(id) {
    const db = ler();
    const antes = db.users.length;
    db.users = db.users.filter((u) => u.id !== Number(id));
    db.sessions = (db.sessions || []).filter((s) => s.user_id !== Number(id));
    salvar(db);
    return db.users.length < antes;
  }
};

// ---------- sessões (login) ----------
const sessoes = {
  criar(userId, token) {
    const db = ler();
    db.sessions = db.sessions || [];
    db.sessions.push({ token, user_id: userId, criado_em: new Date().toISOString() });
    salvar(db);
  },
  porToken: (token) => (ler().sessions || []).find((s) => s.token === token) || null,
  remover(token) {
    const db = ler();
    db.sessions = (db.sessions || []).filter((s) => s.token !== token);
    salvar(db);
  }
};

// ---------- produtos ----------
const produtos = {
  // Catálogo público: só o que está ativo, com estoque e dentro da validade
  listarPublico(filtros = {}) {
    let lista = ler().products.filter((p) => p.ativo !== false && p.estoque > 0 && dentroDaValidade(p));
    if (filtros.q) lista = lista.filter((p) => p.nome.toLowerCase().includes(filtros.q.toLowerCase()));
    if (filtros.categoria) lista = lista.filter((p) => p.categoria === filtros.categoria);
    if (Object.prototype.hasOwnProperty.call(filtros, 'parceiroId')) lista = lista.filter((p) => (p.parceiro_id ?? null) === (filtros.parceiroId ?? null));
    return lista;
  },
  // Painel do parceiro: todos os produtos dele, inclusive vencidos ou zerados
  listarDoParceiro: (parceiroId) => ler().products.filter((p) => p.parceiro_id === Number(parceiroId)),
  porId: (id) => ler().products.find((p) => p.id === Number(id)) || null,
  criar(dados) {
    const db = ler();
    const produto = { id: novoId(db.products), ativo: true, ...dados };
    db.products.push(produto);
    salvar(db);
    return produto;
  },
  atualizar(id, dados) {
    const db = ler();
    const p = db.products.find((x) => x.id === Number(id));
    if (!p) return null;
    Object.assign(p, dados);
    salvar(db);
    return p;
  },
  remover(id) {
    const db = ler();
    const antes = db.products.length;
    db.products = db.products.filter((p) => p.id !== Number(id));
    salvar(db);
    return db.products.length < antes;
  },
  // Confere e desconta estoque de vários itens em uma única operação (tudo ou nada)
  baixarEstoque(itens) {
    const db = ler();
    for (const [id, qtd] of itens) {
      const p = db.products.find((x) => x.id === Number(id));
      if (!p || p.ativo === false || !dentroDaValidade(p)) throw new ErroEstoque(`Produto ${id} indisponível.`);
      if (p.estoque < qtd) throw new ErroEstoque(`Estoque insuficiente de "${p.nome}".`);
    }
    for (const [id, qtd] of itens) {
      db.products.find((x) => x.id === Number(id)).estoque -= qtd;
    }
    salvar(db);
  },
  repor(id, qtd) {
    const db = ler();
    const p = db.products.find((x) => x.id === Number(id));
    if (p) { p.estoque += qtd; salvar(db); }
  }
};
class ErroEstoque extends Error {}

// ---------- pedidos ----------
const pedidos = {
  listarDoUsuario: (userId) => ler().orders.filter((o) => o.user_id === Number(userId)).sort((a, b) => b.id - a.id),
  porId: (id) => ler().orders.find((o) => o.id === Number(id)) || null,
  criar(dados) {
    const db = ler();
    const pedido = { id: novoId(db.orders), status: 'confirmado', criado_em: new Date().toISOString(), ...dados };
    db.orders.push(pedido);
    salvar(db);
    return pedido;
  },
  cancelar(id, userId) {
    const db = ler();
    const p = db.orders.find((o) => o.id === Number(id) && o.user_id === Number(userId));
    if (!p || p.status !== 'confirmado') return null;
    p.status = 'cancelado';
    salvar(db);
    return p;
  }
};

// ---------- mensagens de contato ----------
const mensagens = {
  listar: () => ler().messages,
  criar(dados) {
    const db = ler();
    const msg = { id: novoId(db.messages), criado_em: new Date().toISOString(), ...dados };
    db.messages.push(msg);
    salvar(db);
    return msg;
  }
};

module.exports = { usuarios, sessoes, produtos, pedidos, mensagens, ErroEstoque, dentroDaValidade };
