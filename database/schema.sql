-- Smart Bag: modelo relacional. O protótipo persiste os mesmos dados em database/data.json
-- (arquivo único, sem exigir um servidor de banco instalado); este .sql documenta como as
-- mesmas informações se organizariam em tabelas, para uma futura migração a um SGBD real.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  telefone      TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'consumidor' CHECK (tipo IN ('consumidor','parceiro')),
  senha_hash    TEXT NOT NULL,
  criado_em     TEXT NOT NULL,
  mercado_nome  TEXT,
  mercado_local TEXT,
  mercado_logo  TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token         TEXT PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  criado_em     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nome          TEXT NOT NULL,
  categoria     TEXT NOT NULL,
  preco         REAL NOT NULL CHECK (preco > 0),
  estoque       INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  fab           TEXT NOT NULL,             -- dd/mm/aa
  val           TEXT NOT NULL,             -- dd/mm/aa
  emoji         TEXT,
  imagem        TEXT,
  ativo         INTEGER NOT NULL DEFAULT 1,
  parceiro_id   INTEGER REFERENCES users(id)   -- NULL = catálogo oficial da Smart Bag
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  parceiro_id   INTEGER REFERENCES users(id),
  mercado_nome  TEXT,
  unidade_id    TEXT,
  pagamento     TEXT NOT NULL CHECK (pagamento IN ('pix','debito','credito')),
  entrega       TEXT NOT NULL CHECK (entrega IN ('retirada','delivery')),
  endereco      TEXT,
  cep           TEXT,
  complemento   TEXT,
  bairro        TEXT,
  cidade_uf     TEXT,
  instrucoes_entrega TEXT,
  pagamento_tipo_cartao TEXT,
  cartao_ultimos4 TEXT,
  parcelas      INTEGER,
  subtotal      REAL NOT NULL,
  frete         REAL NOT NULL DEFAULT 0,
  total         REAL NOT NULL,
  status        TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado','cancelado')),
  criado_em     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id),
  nome          TEXT NOT NULL,             -- cópia do nome e preço no momento da compra
  preco         REAL NOT NULL,
  qtd           INTEGER NOT NULL CHECK (qtd > 0)
);

CREATE TABLE IF NOT EXISTS messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assunto       TEXT NOT NULL,
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL,
  msg           TEXT NOT NULL,
  criado_em     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_parceiro ON products(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
