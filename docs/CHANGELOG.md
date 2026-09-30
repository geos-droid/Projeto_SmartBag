# Changelog — Smart Bag

Registro da evolução do sistema entre as versões apresentadas durante a disciplina.

## v0.1 — Protótipo estático (primeira versão)
- Landing page em HTML/CSS/JS puro, sem back-end nem persistência
- Login e carrinho simulados apenas no navegador (sem servidor)
- Sem banco de dados: produtos "fixos" escritos direto no HTML

## v0.5 — Primeiro back-end
- API em Node.js/Express, com dados salvos em arquivo (`database/data.json`)
- Cadastro/login reais, com senha em hash
- Catálogo de produtos servido pela API
- Formulário de contato gravando no banco
- Checkout criando pedidos, mas sem conferir estoque nem descontar

## v1.0 — Versão final para apresentação
- **CRUD completo de produtos**, disponível no novo Painel do Parceiro (`parceiro.html`)
- Estoque real: cada compra desconta do banco; produtos sem estoque ou vencidos somem do catálogo público
- Catálogo ampliado com produtos de verdade em todas as categorias do menu (padaria, açougue, frios, bebidas, mercearia)
- Histórico de pedidos do consumidor, com cancelamento (repõe o estoque)
- Edição de perfil e exclusão de conta
- Filtro por categoria e busca por nome no catálogo
- Modo escuro em todas as páginas
- Ajustes de responsividade para tablet
- Reorganização do back-end em rotas por recurso + middleware de autenticação + camada de dados
- Modelo relacional documentado em `database/schema.sql`, com relação entre usuários, produtos e pedidos
- Documentação completa em `docs/` (arquitetura, API, documento do sistema)
