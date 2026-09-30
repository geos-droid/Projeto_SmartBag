# API Smart Bag — Referência

Todas as respostas são JSON. Erros vêm como `{ "erro": "mensagem" }`.
Rotas marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>` (token obtido no login); com 🔒🏪, além de logado, a conta precisa ser do tipo `parceiro`.

## Autenticação

### `POST /api/auth/register`
Cria uma conta.
```json
{ "nome": "Maria Silva", "email": "maria@email.com", "telefone": "71999990000", "senha": "123456", "tipo": "consumidor" }
```
`tipo` é `"consumidor"` (padrão) ou `"parceiro"`. Resposta `201`, ou `409` se o e-mail já existe.

### `POST /api/auth/login`
```json
{ "email": "maria@email.com", "senha": "123456" }
```
Resposta: `{ "token", "nome", "email", "tipo" }`. `401` se os dados não conferem.

### `POST /api/auth/logout` 🔒
Invalida o token atual.

### `GET /api/auth/me` 🔒
Dados do usuário logado.

### `PUT /api/auth/me` 🔒
```json
{ "nome": "Maria S. Silva", "telefone": "71988887777" }
```

### `DELETE /api/auth/me` 🔒
Exclui a conta e encerra a sessão.

## Produtos

### `GET /api/products?q=&categoria=`
Catálogo público. Retorna só produtos ativos, com estoque e dentro da validade.

### `GET /api/products/mine` 🔒🏪
Todos os produtos do parceiro logado (inclusive vencidos ou sem estoque).

### `GET /api/products/:id`
Detalhe de um produto.

### `POST /api/products` 🔒🏪
```json
{ "nome": "Pão francês", "categoria": "padaria", "preco": 1.20, "estoque": 30, "fab": "20/09/26", "val": "27/09/26", "emoji": "Pão" }
```
Datas no formato `dd/mm/aa`. Resposta `201` com o produto criado (o parceiro logado vira o dono).

### `PUT /api/products/:id` 🔒🏪
Mesmo corpo do cadastro. `403` se o produto não pertence ao parceiro logado.

### `DELETE /api/products/:id` 🔒🏪
`403` se o produto não pertence ao parceiro logado.

## Pedidos

### `POST /api/orders` 🔒
```json
{
  "items": [{ "id": 1, "qtd": 2 }],
  "pagamento": "pix",
  "entrega": "retirada",
  "endereco": null
}
```
`pagamento`: `pix` | `debito` | `credito`. `entrega`: `retirada` | `delivery` (nesse caso `endereco` é obrigatório). Preço e estoque são sempre conferidos no servidor — o total enviado pelo navegador é ignorado. `409` se faltar estoque ou o produto estiver vencido.

### `GET /api/orders` 🔒
Histórico do usuário logado, do mais recente para o mais antigo, com os itens de cada pedido.

### `DELETE /api/orders/:id` 🔒
Cancela um pedido ainda `confirmado` (`404` se já cancelado ou de outro usuário). O estoque dos itens volta automaticamente.

## Contato

### `POST /api/contact`
```json
{ "assunto": "Cadastro de parceiro", "nome": "João", "email": "joao@email.com", "msg": "Quero cadastrar meu mercado." }
```
