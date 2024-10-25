
const express = require('express');
const path = require('path');
__path = process.cwd()
const app = express();
const PORT = 8080;

// Importando as rotas da API
const apiRoutes = require('./apis');

// Servir arquivos estáticos da pasta "public"
app.use(express.static("estilo"))

// Usar as rotas da API
app.use(apiRoutes);

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__path, '/home/index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`\nServidor rodando em http://localhost:${PORT}`);
});
