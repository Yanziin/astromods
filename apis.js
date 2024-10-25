
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const search = require('yt-search');

const router = express.Router();

const semkeyPath = path.join(__dirname, 'home', 'semkey.html');

const keyFilePath = path.join(__dirname, '/dados/venomkey.json');

let apikeys;

fs.readFile(keyFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Erro ao ler o arquivo venomkey.json:', err);
        return;
    }
    try {
        const keyData = JSON.parse(data);
        apikeys = keyData.apikey; // Supondo que o JSON tenha um campo "apikey"
    } catch (error) {
        console.error('Erro ao analisar o JSON:', error);
    }
});

// Função para gerar CPF aleatório
function gerarCPF() {
    let n = '';
    for (let i = 0; i < 9; i++) {
        n += Math.floor(Math.random() * 10);
    }
    const cpf = n.split('');
    let v1 = 0;
    let v2 = 0;
    for (let i = 0; i < 9; i++) {
        v1 += cpf[i] * (10 - i);
        v2 += cpf[i] * (11 - i);
    }
    v1 = (v1 % 11) < 2 ? 0 : 11 - (v1 % 11);
    cpf.push(v1);
    v2 += v1 * 2;
    v2 = (v2 % 11) < 2 ? 0 : 11 - (v2 % 11);
    cpf.push(v2);
    return cpf.join('');
}

// Rota para pesquisa no YouTube
router.get('/api/youtube-search', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    const query = req.query.query; // Termo de pesquisa enviado como query parameter

    if (!query) {
        return res.status(400).json({ error: 'É necessário fornecer um termo de pesquisa.' });
    }

    try {
        const videoResult = await search(query);
        const videos = videoResult.videos.slice(0, 10); // Limitando para 10 vídeos

        const formattedVideos = videos.map(video => ({
            link: video.url,
            title: video.title,
            thumbnail: video.thumbnail,
            channel: video.author.name,
            views: video.views,
            likes: video.likes,
            creator: video.author.name,
            duration: video.timestamp
        }));

        res.json({criador: 'Astro Mods', formattedVideos});
    } catch (error) {
        console.error('Erro ao buscar vídeos do YouTube:', error.message);
        res.status(500).json({ error: 'Erro ao buscar vídeos do YouTube' });
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para consulta de CEP
// Rota para consulta de CEP
router.get('/api/consulta/cep/:cep', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
        const cep = req.params.cep;
        if (!cep) return res.json({ erro: "Digite o CEP no parâmetro da URL" });

        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            const data = response.data;

            const { state, city, neighborhood, street } = data;

            res.json({
                criador: 'Astro Mods',
                cep: cep,
                estado: state,
                cidade: city,
                vizinhança: neighborhood,
                rua: street,
                serviço: 'open-cep'
            });
        } catch (error) {
            console.error('Erro ao consultar API de CEP:', error.message);
            res.status(error.response?.status || 500).json({ error: 'Erro ao consultar API de CEP' });
        }
    } else {
        res.sendFile(semkeyPath);
    }
});

// Rota para consulta de cidades por DDD
router.get('/api/consulta/ddd/:ddd', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    const ddd = req.params.ddd;
    if(!ddd) return res.json({erro: "digite o ddd no parâmetro da url"})

    try {
        const response = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
        const data = response.data;

        // Mapeia o estado associado ao DDD consultado
        const state = data.state;

        // Lista de cidades associadas ao DDD
        const cities = data.cities;

        res.json({
            criador: 'Astro Mods',
            state: state,
            cities: cities
        });
    } catch (error) {
        console.error('Erro ao consultar API de DDD:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao consultar API de DDD' });
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para consulta de dados climáticos por aeroporto
router.get('/api/consulta/clima/aeroporto/:codigoICAO', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    const codigoICAO = req.params.codigoICAO;

    try {
        const response = await axios.get(`https://brasilapi.com.br/api/cptec/v1/clima/aeroporto/${codigoICAO}`);
        const data = response.data;

        // Extrai os dados conforme especificado
        const {
            umidade,
            visibilidade,
            codigo_icao,
            pressao_atmosferica,
            vento,
            direcao_vento,
            condicao,
            condicao_desc,
            temp,
            atualizado_em
        } = data;

        // Formata os dados conforme o modelo desejado
        const formattedData = {
            criador: 'Astro Mods',
            umidade: umidade,
            visibilidade: visibilidade,
            codigo_icao: codigo_icao,
            pressao_atmosferica: pressao_atmosferica,
            vento: vento,
            direcao_vento: direcao_vento,
            condicao: condicao,
            condicao_desc: condicao_desc,
            temp: temp,
            atualizado_em: atualizado_em
        };

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao consultar API de dados climáticos:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao consultar API de dados climáticos' });
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para obter um GIF aleatório
router.get('/api/video-aleatorio', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
// Caminho para o arquivo JSON
const videoFilePath = path.join(__dirname, 'dados', 'videos.json');

// Função para ler o arquivo JSON
function lerArquivoJSON() {
    const rawdata = fs.readFileSync(videoFilePath);
    return JSON.parse(rawdata);
}

    try {
        // Carregar os GIFs do arquivo JSON
        const videoData = lerArquivoJSON();
        const videos = videoData.videos;

        // Escolher um GIF aleatório
        const randomIndex = Math.floor(Math.random() * videos.length);
        const randomVideoUrl = videos[randomIndex];

        // Fazer requisição para obter o GIF
        const response = await axios.get(randomVideoUrl, { responseType: 'arraybuffer' });

        // Enviar o GIF como resposta
        res.set('Content-Type', 'video/mp4'); // Define o tipo de conteúdo como imagem GIF
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Erro ao obter o vidso aleatório:', error);
        res.status(500).send('Erro ao obter VIDEO aleatório');
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para obter uma imagem aleatória
router.get('/api/loli-aleatoria', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
// Caminho para o arquivo JSON
const loliFilePath = path.join(__dirname, 'dados', 'loli.json');

// Função para ler o arquivo JSON
function lerArquivoJSON() {
    const rawdata = fs.readFileSync(loliFilePath);
    return JSON.parse(rawdata);
}

    try {
        // Carregar as imagens do arquivo JSON
        const loliData = lerArquivoJSON();
        const venomlolis = loliData.venomlolis;

        // Escolher uma imagem aleatória
        const randomIndex = Math.floor(Math.random() * venomlolis.length);
        const randomLoliUrl = venomlolis[randomIndex];

        // Fazer requisição para obter a imagem
        const response = await axios.get(randomLoliUrl, { responseType: 'arraybuffer' });

        // Enviar a imagem como resposta
        res.set('Content-Type', 'image/jpeg'); // Define o tipo de conteúdo como imagem JPEG
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Erro ao obter a imagem aleatória:', error);
        res.status(500).send('Erro ao obter a imagem aleatória');
    }   
    } else {
        res.sendFile(semkeyPath);
    }    
});


router.get('/api/dados-pessoais', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    try {
        const response = await axios.get('https://randomuser.me/api/');
        const userData = response.data.results[0];

        const personalData = {
            nomeCompleto: `${userData.name.first} ${userData.name.last}`,
            idade: userData.dob.age,
            cpf: userData.login.uuid.substring(0, 14),
            email: userData.email,
            telefone: userData.phone,
            cidade: userData.location.city,
            estado: userData.location.state,
            cep: userData.location.postcode,
            endereco: `${userData.location.street.name}, ${userData.location.street.number}`,
            foto: userData.picture.large
        };

        res.json({ criador: 'Astro Mods', resultado: personalData });
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        res.status(500).json({ error: 'Erro ao obter dados do usuário' });
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para gerar CPF aleatório
router.get('/api/gerar-cpf', (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    const cpf = gerarCPF();
    res.json({ criador: 'Venom Mods', cpf: cpf });
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para gerar frase aleatória
router.get('/api/frase-aleatoria', (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    try {
        // Caminho para o arquivo JSON com as frases
        const filePath = path.join(__dirname, 'dados', 'frases.json');

        // Lendo o conteúdo do arquivo JSON
        const frasesData = fs.readFileSync(filePath, 'utf8');
        const frases = JSON.parse(frasesData);

        // Escolhendo aleatoriamente uma frase
        const randomIndex = Math.floor(Math.random() * frases.length);
        const fraseAleatoria = frases[randomIndex];

        res.json({ criador: 'Astro Mods', frase: fraseAleatoria });
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON:', error);
        res.status(500).json({ error: 'Erro ao obter frase aleatória' });
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para obter imagem aleatória do arquivo JSON local
router.get('/api/imagem-aleatoria', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    try {
        // Caminho para o arquivo JSON
        const filePath = path.join(__dirname, 'dados', 'imagens.json');

        // Lendo o conteúdo do arquivo JSON
        const venomimagensData = fs.readFileSync(filePath, 'utf8');
        const venomimagens = JSON.parse(venomimagensData).venomimagens;

        // Escolhendo aleatoriamente uma URL de imagem
        const imagemAleatoria = venomimagens[Math.floor(Math.random() * venomimagens.length)];

        // Fazendo requisição para obter a imagem
        const response = await axios.get(imagemAleatoria, { responseType: 'arraybuffer' });

        // Enviando a imagem como resposta
        res.set('Content-Type', 'image/jpeg'); // Define o tipo de conteúdo como imagem JPEG
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Erro ao obter imagem aleatória:', error);
        res.status(500).send('Erro ao obter imagem aleatória');
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});


// Rota para obter imagem aleatória do arquivo JSON local
router.get('/api/imagem-dev', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    try {
        // Caminho para o arquivo JSON
        const filePath = path.join(__dirname, 'dados', 'fotodev.json');

        // Lendo o conteúdo do arquivo JSON
        const venomimagensData = fs.readFileSync(filePath, 'utf8');
        const venomimagens = JSON.parse(venomimagensData).venomimagens;

        // Escolhendo aleatoriamente uma URL de imagem
        const imagemAleatoria = venomimagens[Math.floor(Math.random() * venomimagens.length)];

        // Fazendo requisição para obter a imagem
        const response = await axios.get(imagemAleatoria, { responseType: 'arraybuffer' });

        // Enviando a imagem como resposta
        res.set('Content-Type', 'image/jpeg'); // Define o tipo de conteúdo como imagem JPEG
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Erro ao obter imagem aleatória:', error);
        res.status(500).send('Erro ao obter imagem aleatória');
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

// Rota para obter imagem aleatória do arquivo JSON local
router.get('/api/imagem-pokemon', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikeys) {
        return res.status(500).json({ error: 'Digite sua apikey no parâmetro do url' });
    }

    if (apikeys.includes(apikey)) {
    try {
        // Caminho para o arquivo JSON
        const filePath = path.join(__dirname, 'dados', 'pokemon.json');

        // Lendo o conteúdo do arquivo JSON
        const venomimagensData = fs.readFileSync(filePath, 'utf8');
        const venomimagens = JSON.parse(venomimagensData).venomimagens;

        // Escolhendo aleatoriamente uma URL de imagem
        const imagemAleatoria = venomimagens[Math.floor(Math.random() * venomimagens.length)];

        // Fazendo requisição para obter a imagem
        const response = await axios.get(imagemAleatoria, { responseType: 'arraybuffer' });

        // Enviando a imagem como resposta
        res.set('Content-Type', 'image/jpeg'); // Define o tipo de conteúdo como imagem JPEG
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Erro ao obter imagem aleatória:', error);
        res.status(500).send('Erro ao obter imagem aleatória');
    }
    } else {
        res.sendFile(semkeyPath);
    }    
});

module.exports = router;
