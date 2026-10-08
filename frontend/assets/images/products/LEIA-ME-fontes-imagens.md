# Imagens dos produtos — situação real

As fotos ainda **não são cópias locais**: o catálogo (`database/data.json`) aponta para URLs de varejistas/fabricantes, e os SVGs desta pasta são só fallback.

Para baixar as fotos para esta pasta (precisa de internet):

    npm run imagens:baixar      # baixa, valida os bytes e troca `imagem` por caminho local (a URL vai para `imagem_origem`)
    npm run imagens:verificar   # audita arquivos, caminhos, duplicadas e URLs remotas

Depois confira visualmente cada foto (marca, sabor, peso) e marque como conferida:

    node scripts/imagens-produtos.mjs conferir 1 2 3

Relatórios gerados: `docs/relatorio-imagens.json` e `docs/fontes-imagens-produtos.md`.
Licença/permissão de uso de cada foto **não foi verificada** — confirme com a fonte antes de publicar.
