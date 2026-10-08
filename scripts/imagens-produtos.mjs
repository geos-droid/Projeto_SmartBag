#!/usr/bin/env node
// Baixa, valida e audita as imagens dos produtos do catálogo (database/data.json).
//
// Uso (precisa de internet para "baixar"):
//   node scripts/imagens-produtos.mjs baixar      -> baixa as URLs remotas para frontend/assets/images/products/
//   node scripts/imagens-produtos.mjs verificar   -> audita arquivos, caminhos, duplicados, URLs remotas
//   node scripts/imagens-produtos.mjs baixar --dry-run
//
// Regras:
//  - Só troca `imagem` por caminho local quando o download E a validação de bytes passam.
//  - A URL original fica em `imagem_origem` (e vira fallback no frontend).
//  - O script NÃO confirma que a foto corresponde ao produto: isso é conferência humana.
//    Por isso `imagem_conferida` fica false até você marcar true (ou usar --conferir <id>).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(RAIZ, 'database/data.json');
const PASTA = path.join(RAIZ, 'frontend/assets/images/products');
const DOCS = path.join(RAIZ, 'docs');
const [, , cmd = 'verificar', ...args] = process.argv;
const dry = args.includes('--dry-run');
const hoje = new Date().toISOString().slice(0, 10);

const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const remota = (u) => /^https?:\/\//i.test(u || '');

function tipo(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null; // HTML, SVG, vazio etc. não valem como fotografia
}

const ler = () => JSON.parse(fs.readFileSync(DATA, 'utf8'));
const salvar = (d) => fs.writeFileSync(DATA, JSON.stringify(d, null, 2) + '\n');

async function baixarUm(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (SmartBag image sync)', Accept: 'image/*' },
    signal: AbortSignal.timeout(20000), redirect: 'follow'
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  const ext = tipo(buf);
  if (!ext) throw new Error('conteúdo não é JPEG/PNG/WebP válido');
  if (buf.length < 3000) throw new Error('arquivo pequeno demais (' + buf.length + ' bytes)');
  return { buf, ext };
}

async function baixar() {
  const d = ler();
  fs.mkdirSync(PASTA, { recursive: true });
  const res = [];
  for (const p of d.products) {
    const origem = p.imagem_origem || (remota(p.imagem) ? p.imagem : null);
    if (!origem) { res.push({ id: p.id, nome: p.nome, status: 'sem-url-remota', arquivo: p.imagem || null }); continue; }
    try {
      if (dry) { res.push({ id: p.id, nome: p.nome, status: 'dry-run', origem }); continue; }
      const { buf, ext } = await baixarUm(origem);
      const arq = `${slug(p.nome)}.${ext}`;
      fs.writeFileSync(path.join(PASTA, arq), buf);
      p.imagem_origem = origem;
      p.imagem = `assets/images/products/${arq}`;
      p.imagem_conferida = p.imagem_conferida === true;
      p.imagem_data = hoje;
      res.push({ id: p.id, nome: p.nome, status: 'baixada', arquivo: arq, bytes: buf.length, origem });
      console.log('OK  ', p.nome, '->', arq);
    } catch (e) {
      res.push({ id: p.id, nome: p.nome, status: 'falhou', erro: String(e.message || e), origem });
      console.log('FALHA', p.nome, '-', e.message || e);
    }
  }
  if (!dry) salvar(d);
  relatorio(d, res);
}

function auditar(d) {
  const linhas = [], hashes = new Map();
  const c = { total: d.products.length, locaisValidas: 0, remotasAinda: 0, svgFallback: 0, ausentes: 0, invalidas: 0, duplicadas: 0, conferidas: 0 };
  for (const p of d.products) {
    const l = { id: p.id, nome: p.nome, imagem: p.imagem, origem: p.imagem_origem || null, conferida: p.imagem_conferida === true, problemas: [] };
    if (!p.imagem) { l.problemas.push('sem imagem'); c.ausentes++; }
    else if (remota(p.imagem)) { l.problemas.push('ainda usa URL remota'); c.remotasAinda++; }
    else {
      const f = path.join(RAIZ, 'frontend', p.imagem);
      if (!fs.existsSync(f)) { l.problemas.push('arquivo não existe'); c.ausentes++; }
      else if (f.endsWith('.svg')) { l.problemas.push('SVG ilustrativo (não é fotografia)'); c.svgFallback++; }
      else {
        const b = fs.readFileSync(f);
        if (!tipo(b)) { l.problemas.push('arquivo não é imagem válida'); c.invalidas++; }
        else {
          c.locaisValidas++;
          const h = crypto.createHash('sha256').update(b).digest('hex');
          if (hashes.has(h)) { l.problemas.push('idêntica à de ' + hashes.get(h)); c.duplicadas++; } else hashes.set(h, p.nome);
        }
      }
    }
    if (l.conferida) c.conferidas++;
    if (!l.conferida) l.problemas.push('correspondência com o produto ainda não conferida por pessoa');
    linhas.push(l);
  }
  return { c, linhas };
}

function relatorio(d, resDownload = []) {
  const { c, linhas } = auditar(d);
  const pendentes = linhas.filter((l) => l.problemas.some((x) => !x.startsWith('correspondência')));
  fs.mkdirSync(DOCS, { recursive: true });
  fs.writeFileSync(path.join(DOCS, 'relatorio-imagens.json'), JSON.stringify({ data: hoje, resumo: c, download: resDownload, pendentes }, null, 2) + '\n');
  let md = `# Fontes das imagens dos produtos\n\nGerado por \`scripts/imagens-produtos.mjs\` em ${hoje}. Nada aqui foi inventado: URLs vêm do catálogo; a coluna "Situação" reflete o estado real dos arquivos.\n\n`;
  md += `Resumo: ${c.total} produtos · ${c.locaisValidas} com foto local válida · ${c.remotasAinda} ainda com URL remota · ${c.svgFallback} com SVG · ${c.conferidas} conferidos por pessoa.\n\n`;
  md += `| Produto | Arquivo local / caminho atual | URL de origem | Situação | Licença/uso |\n|---|---|---|---|---|\n`;
  for (const l of linhas) {
    md += `| ${l.nome} | ${l.imagem || '—'} | ${l.origem || (remota(l.imagem) ? l.imagem : '—')} | ${l.problemas.join('; ') || 'ok'} | não verificada — confirmar com a fonte |\n`;
  }
  fs.writeFileSync(path.join(DOCS, 'fontes-imagens-produtos.md'), md);
  console.log('\nResumo:', c);
  if (pendentes.length) { console.log('\nPendentes:'); pendentes.forEach((p) => console.log(' -', p.nome, '→', p.problemas.join('; '))); }
}

if (cmd === 'baixar') await baixar();
else if (cmd === 'verificar') relatorio(ler());
else if (cmd === 'conferir') { // marca como conferido por pessoa: node scripts/imagens-produtos.mjs conferir 1 2 3
  const d = ler(); const ids = args.map(Number);
  d.products.forEach((p) => { if (ids.includes(p.id)) p.imagem_conferida = true; });
  salvar(d); relatorio(d);
} else { console.error('Comandos: baixar | verificar | conferir <ids>'); process.exit(1); }
