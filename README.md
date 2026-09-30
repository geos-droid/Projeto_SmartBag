# Smart Bag

Do desperdício à sacola inteligente. Plataforma que conecta supermercados de Candeias-BA a consumidores, oferecendo produtos próximos da validade com desconto — projeto nascido na Escola SESI Candeias.

## Descrição da aplicação

Smart Bag é uma aplicação web full-stack com três papéis em um só sistema:

- **Consumidor**: navega pelo catálogo, filtra por categoria e busca, monta um carrinho, finaliza a compra (Pix, débito ou crédito; retirada ou delivery) e acompanha o histórico de pedidos, podendo cancelar os que ainda não foram entregues.
- **Parceiro (mercado/comércio local)**: cadastra e gerencia o próprio estoque de produtos com desconto (criar, editar e excluir), acompanhando quantos itens estão disponíveis e quantos já venceram.
- **Visitante**: conhece a proposta, entende como funciona e envia mensagens pelo formulário de contato (dúvidas, parceria ou contato geral).

## Objetivo

Reduzir o desperdício de alimentos em Candeias-BA, dando visibilidade e um canal de venda rápido para produtos com validade próxima, ao mesmo tempo em que consumidores economizam no dia a dia.

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5, CSS3, JavaScript (Vanilla, sem framework), Vite |
| Back-end | Node.js, Express |
| Comunicação | Fetch API (JSON), autenticação por token (Bearer) |
| Persistência | Arquivo de dados estruturado (`database/data.json`), com o modelo relacional equivalente documentado em `database/schema.sql` |
| Ferramentas | npm, concurrently (roda front e back juntos em desenvolvimento) |

## Como instalar

Pré-requisito: Node.js 20 ou superior.

```bash
git clone <link-do-repositorio>
cd Projeto
npm install
```

## Como executar

Modo desenvolvimento (front-end com recarregamento automático + back-end na mesma hora):

```bash
npm run dev
```

- Front-end: http://localhost:5173
- Back-end (API): http://127.0.0.1:3001
- O Vite encaminha automaticamente as chamadas `/api/...` para o back-end.

Também é possível rodar cada parte separadamente:

```bash
npm run backend    # só a API, na porta 3001
npm run frontend   # só o front-end, na porta 5173
```

Para gerar uma versão de produção (arquivos estáticos otimizados) e servi-la pelo próprio back-end:

```bash
npm run build
npm run backend
```

## Estrutura do projeto

```
Projeto/
│
├── frontend/       Páginas (landing, login/cadastro, dashboard, painel do parceiro, minha conta), CSS e JS
├── backend/        API Node.js/Express — src/server.js, rotas, middleware e camada de dados
├── database/       schema.sql (modelo relacional), seed.sql (dados iniciais) e data.json (dados em uso)
├── assets/         Logo e imagens
├── docs/           Documentação técnica do sistema
├── README.md
└── package.json
```

## Funcionalidades principais

- **Login e cadastro** com dois tipos de conta (consumidor / parceiro), senha protegida por hash e sessão por token
- **Catálogo de produtos** com busca por nome e filtro por categoria, mostrando validade e estoque restante
- **Carrinho de compras** com seleção de itens, forma de pagamento e opção de entrega
- **Checkout real**: o servidor recalcula o total pelos preços do banco, confere estoque e validade, e só então confirma o pedido
- **Histórico de pedidos** do consumidor, com opção de cancelar pedidos ainda confirmados (o estoque volta automaticamente)
- **Painel do parceiro**: CRUD completo de produtos (cadastrar, listar, editar, excluir), com resumo de quantos itens estão disponíveis ou vencidos
- **Minha conta**: editar nome/telefone ou excluir a própria conta
- **Fale conosco** com validação de campos e envio ao servidor
- **Modo escuro** em todas as páginas, com preferência salva no navegador
- **Responsivo** para celular, tablet e desktop

## Integrantes da equipe

> *(preencher com os nomes completos dos integrantes)*

- Integrante 1
- Integrante 2
- Integrante 3

## Instituição

SENAI Candeias

## Professor orientador

Adalberto Santana

## Documentação completa

Veja a pasta [`docs/`](docs/): `DOCUMENTO_DO_SISTEMA.md` (documento completo do sistema), `ARCHITECTURE.md` (arquitetura) e `API.md` (referência dos endpoints).
