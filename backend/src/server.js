// Servidor Smart Bag: expõe a API em /api. Em desenvolvimento o Vite roda à parte
// e encaminha /api para cá (ver vite.config.js); em produção este servidor também
// entrega os arquivos estáticos de frontend/dist, se existirem (npm run build).
const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, servico: 'smartbag' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/markets', require('./routes/markets'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Serve o build de produção do frontend, se ele existir (npm run build && npm start)
const dist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(['/', '/index.html'], (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  app.get('/login.html', (_req, res) => res.sendFile(path.join(dist, 'login.html')));
  app.get('/dashboard.html', (_req, res) => res.sendFile(path.join(dist, 'dashboard.html')));
  app.get('/parceiro.html', (_req, res) => res.sendFile(path.join(dist, 'parceiro.html')));
  app.get('/conta.html', (_req, res) => res.sendFile(path.join(dist, 'conta.html')));
}

// Tratador de erros: nunca deixa a exceção derrubar o processo nem vazar detalhes internos
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno. Tente novamente.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart Bag API em http://127.0.0.1:${PORT}`);
});
