const bla = process.cwd()
//======== INFO / CRÉDITOS ========\\
/* Base: Pedrozz/Paiço
Criador: RussoDevs7
*/
//==========MODULOS=========\\
const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const request = require('request');

//======CONFIG======\\
const key = require("./database/apikeys.json");
const criador = 'RussoDevs7';
const senhaAdm = 'eorusso';
const keyFile = path.join(__dirname, "database", "apikeys.json"); // caminho do arquivo

//======SCRAPERS========\\
const { ytVideosSearch, ytMp3Query, ytMp4Query, ytMp3, ytMp4, instagramDl, tiktokDl, xvideosDl, apkpureDl, audiomeme, wikipedia, amazon, tiktokQuery, apkpureQuery, xvideosQuery, aptoide, Pinterest, PinterestMultiMidia, wallpaper, Playstore, CanvabemVindo, canvaLevel, figurinhas, canvaMusicCard, canvaMusicCard2, canvaMontagem, Hentaizinho, Hentaizinho2, travaZapImg, travaZapImg2, metadinha, metadinha2, logo, gemini, dalle, imagineAi, multiAi, consultas } = require('./database/scraper.js')

//======================\\
const app = express();
const PORT = 3000;



const getInfo = require("./database/opsanime.js");


var { getVideoInfo, getDownloadLink } = require ('./database/scrapers/ytmp4.js');

//=====MIDDLEWARES======\\\
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//========FUNÇÕES=========\\
const cores = {
  reset: '\x1b[0m',
  preto: '\x1b[30m',
  vermelho: '\x1b[31m',
  verde: '\x1b[32m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  magenta: '\x1b[35m',
  ciano: '\x1b[36m',
  branco: '\x1b[37m',
  negrito: '\x1b[1m',
  sublinhado: '\x1b[4m',
  reverso: '\x1b[7m',
  semCor: '\x1b[0m'
};

function colorirConsole(texto) {
  return texto.replace(/%(\w+)%/g, (match, nome) => {
    return cores[nome] || match;
  });
}



function LerDadosApikey() {
  if (!fs.existsSync(keyFile)) return {};
  return JSON.parse(fs.readFileSync(keyFile, "utf8"));
}

function SalvarDadosApikey(data) {
  fs.writeFileSync(keyFile, JSON.stringify(data, null, 2));
}
function diminuirRequest(apikey) {
const data = LerDadosApikey();
if (!data[apikey]) { return { success: false, message: 'Apikey não registrada pelo administrador, compre uma apikey e tente novamente 😊👌' }; }
if (data[apikey].request <= 0) { return { success: false, message: 'Você atingiu o limite de requisições 🚫' };}
data[apikey].request--;
SalvarDadosApikey(data);

}
//======ROTAS========\\

app.get('/api/keyerrada', (req, res) => {
  const apikey = req.query.apikey;
  const data = LerDadosApikey();

  if (!apikey || !data[apikey]) {
    return res.json({ error: '❌ Sua apikey é inválida ou não existe' });
  }

  res.json({
    key: `✅ Sua ApiKey está 100% - Requests Restantes: ${data[apikey].request}`
  });
});
//REGISTRAR KEY
app.post('/api/apikey/add/apikey', (req, res) => {
  const { senha, apikey, request } = req.body;
  if (senha !== senhaAdm) return res.status(403).json({ error: 'Senha incorreta' });

  const data = LerDadosApikey();
  if (data[apikey]) return res.status(400).json({ error: 'API Key já existe' });

  data[apikey] = { request: request || 100 };
  SalvarDadosApikey(data);
  res.json({ success: true, message: 'API Key criada', apikey });
});

// 🗑️ Deletar uma API Key
app.post('/api/apikey/del/apikey', (req, res) => {
  const { senha, apikey } = req.body;
  if (senha !== senhaAdm) return res.status(403).json({ error: 'Senha incorreta' });

  const data = LerDadosApikey();
  if (!data[apikey]) return res.status(404).json({ error: 'API Key não encontrada' });

  delete data[apikey];
  SalvarDadosApikey(data);
  res.json({ success: true, message: 'API Key deletada' });
});

//ATUALIZAR REQUEST
app.post('/api/apikey/add/request', (req, res) => {
  const { senha, apikey, request } = req.body;
  if (senha !== senhaAdm) return res.status(403).json({ error: 'Senha incorreta' });

  const data = LerDadosApikey();
  if (!data[apikey]) return res.status(404).json({ error: 'API Key não encontrada' });

  data[apikey].request = request;
  SalvarDadosApikey(data);
  res.json({ success: true, message: 'Limite atualizado', apikey });
});

//VERIFICAR KEY
app.get('/api/apikey/verificar', async (req, res) => {
  const key = req.query.apikey;
  const data = LerDadosApikey();

  if (!data[key]) return res.status(404).json({ error: 'API Key inválida' });

  res.json({ key, request: data[key].request });
});
//ROTAS DE APIs
//Download



app.post('/ytmp4', async (req, res) => {
  const { url, quality } = req.body
  if (!url || !quality) return res.status(400).json({ status: false, message: 'Informe URL e qualidade' })

  try {
    const info = await getVideoInfo(url)          // CHAMANDO O SCRAPER
    const videoBuffer = await getDownloadLink(url, quality) // CHAMANDO O SCRAPER

    res.setHeader('Content-Disposition', `attachment; filename="${info.title} - ${quality}.mp4"`)
    res.setHeader('Content-Type', 'video/mp4')
    res.send(videoBuffer)
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
})


app.get('/api/tiktoksearch', async (req, res) => {
    const { query, apikey } = req.query;

    if (!apikey) return res.status(429).json({ error: "Cadê o parâmetro apikey?" });
    if (!key[apikey]) return res.status(403).json({ error: "Apikey inválida" });
    if (!query) return res.status(400).json({ error: 'Cadê o parâmetro query?' });

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://yuxinze-apis.onrender.com/pesquisas/tiktok-search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data || !data.resultado || data.resultado.length === 0) {
            return res.status(404).json({ error: 'Nenhum vídeo encontrado' });
        }

        key[apikey].request--; // decrementa request

        res.json({
            query,
            resultados: data.resultado.map(item => ({
                capa: item.capa,
                capa_original: item.capa_original,
                link: item.link
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao pesquisar TikTok' });
    }
});

app.get('/api/tiktokdl', async (req, res) => {
    const { url, apikey } = req.query;

    // checa apikey
    if (!apikey) return res.status(429).json({ error: "Cadê o parâmetro apikey?" });
    if (!key[apikey]) return res.status(403).json({ error: "Apikey inválida" });

    if (!url) return res.status(400).json({ error: 'Cadê o parâmetro url?' });

    try {
        const response = await fetch(`https://yuxinze-apis.onrender.com/download/tiktok?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (!data || !data.resultado) {
            return res.status(404).json({ error: 'Nenhum vídeo encontrado' });
        }

        // decrementa requests
        key[apikey].request--;

        res.json({
            url,
            titulo: data.resultado.titulo,
            visualizacoes: data.resultado.visualizacoes,
            comentarios: data.resultado.comentarios,
            likes: data.resultado.likes,
            compartilhamentos: data.resultado.compartilhamentos,
            downloads: data.resultado.downloads,
            duracao: data.resultado.duracao,
            video: data.resultado.video,
            audio: data.resultado.audio
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao baixar TikTok' });
    }
});




/*app.get('/api/download/ytmp4', async (req, res) => {
  const { url, apikey } = req.query;

  if (!apikey) return res.status(400).json({ error: "Faltando apikey" });
  if (!key[apikey]) return res.status(403).json({ error: "Apikey inválida" });
  if (!url) return res.status(400).json({ error: "Faltando URL do vídeo" });

  try {
    const video = await youtube.getVideo(url);

    key[apikey].request--; // decrementa requests

    res.json({
      criador: "Ikaro Nawan",
      titulo: video.title,
      autor: video.author.name,
      duracao: video.durationFormatted,
      thumbnail: video.thumbnails[video.thumbnails.length - 1].url,
      url: url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter informações do vídeo" });
  }
});
*/

app.get('/api/spotify', async (req, res) => {
    const { url, apikey } = req.query;

    // checa apikey
    if (!apikey) return res.status(429).json({ error: "Cadê o parâmetro apikey?" });
    if (!key[apikey]) return res.status(403).json({ error: "Apikey inválida" });

    if (!url) return res.status(400).json({ error: 'Cadê o parâmetro url?' });

    try {
        // consulta a API externa
        const apiResponse = await fetch(`https://yuxinze-apis.onrender.com/download/spotify?url=${encodeURIComponent(url)}`);
        const data = await apiResponse.json();

        if (!data.status || !data.resultado) {
            return res.status(404).json({ error: 'Nenhuma música encontrada' });
        }

        // decrementa requests
        key[apikey].request--;

        // envia o resultado
        res.json({
            status: "success",
            title: data.resultado.title,
            artists: data.resultado.artists,
            releaseDate: data.resultado.releaseDate,
            cover: data.resultado.cover,
            music: data.resultado.music
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar Spotify' });
    }
});

app.get('/api/pinsearch', async (req, res) => {
    const { query, apikey } = req.query;

    // checa apikey
    if (!apikey) return res.status(429).json({ error: "Cadê o parâmetro apikey?" });
    if (!key[apikey]) return res.status(403).json({ error: "Apikey inválida" });

    if (!query) return res.status(400).json({ error: 'Cadê o parâmetro query?' });

    try {
        // Chama a API externa Yuxinze
        const response = await fetch(`https://yuxinze-apis.onrender.com/pesquisas/pinterest?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.status || !data.resultado) {
            return res.status(404).json({ error: 'Nenhuma imagem encontrada' });
        }

        // decrementa requests
        key[apikey].request--;

        res.json({
            query,
            imagem: data.resultado // URL da imagem
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao pesquisar Pinterest' });
    }
});

const ScrapperLyrics = require('./database/scrapers/ScrapperLyrics.js');

    
// GET 
app.get('/api/lyrics', async (req, res) => {
    try {
        const { query, apikey } = req.query;

        // checagem da apikey
        if (!apikey) return res.status(403).json({ status: false, error: "Cadê a apikey?" });
        if (!key[apikey]) return res.status(403).json({ status: false, error: "Apikey inválida" });

        // checagem do query
        if (!query || query.trim() === '') {
            return res.status(400).json({ status: false, error: 'Campo "query" é obrigatório.' });
        }

        // chama o scrapper
        const results = await ScrapperLyrics.get(query.trim());

        // decrementa requests
        key[apikey].request--;
        SalvarDadosApikey(key);

        res.json({
            status: true,
            results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            error: err.message || 'Erro ao buscar letras.'
        });
    }
});





app.get('/api/ytsearch', async (req, res) => {  
    const { apikey, query } = req.query;

    // checa se a pessoa não mandou apikey

    if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!query) {
        return res.status(400).json({ error: 'Cadê o parametro query?'});
    }

    try {  
        const result = await yts(query);  
        const video = result.videos[0];  

        if (!video) return res.status(404).json({ error: 'Nenhum vídeo encontrado' });  

        // decrementa requests
        key[apikey].request--;

        res.json({  
            "titulo": video.title,  
            "url": video.url,  
            "canal": {  
                "nome": video.author.name,  
                "link": video.author.url  
            },  
            "visualizacoes": video.views,  
            "postagem": video.ago,  
            "duracao": video.timestamp,  
            "descricao": video.description,  
            "thumbnail": video.thumbnail  
        });  
    } catch (err) {  
        console.error(err);  
        res.status(500).json({ error: 'Erro ao pesquisar vídeo' });  
    }  
});



/// PUXADAS ///

app.get('/api/consulta/nome', async (req, res) => {
    const { consulta, apikey } = req.query;

  if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!consulta) {
        return res.status(400).json({ error: 'Cade o parametro consulta?'});
    }
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`http://node.tconect.xyz:2122/nome.php?consulta=${encodeURIComponent(consulta)}`);
        const data = await response.json();

        if (!data || !data.success || !data.data || data.data.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        key[apikey].request--; // decrementa requests

        res.json({
            criador: "RussoDevs7",
            resultado: data.data[0] // pega o primeiro da lista
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar dados' });
    }
});



app.get('/api/consulta/cpf', async (req, res) => {
    const { consulta, apikey } = req.query;

  if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!consulta) {
        return res.status(400).json({ error: 'Cade o parametro consulta?'});
    }
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`http://node.tconect.xyz:2122/cpf.php?consulta=${encodeURIComponent(consulta)}`);
        const data = await response.json();

        if (!data || !data.sucess || !data.data || data.data.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        key[apikey].request--; // decrementa requests

        res.json({
            criador: "RussoDevs7",
            resultado: data.data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar dados' });
    }
});

app.get('/api/consulta/telefone', async (req, res) => {
    const { consulta, apikey } = req.query;

  if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!consulta) {
        return res.status(400).json({ error: 'Cade o parametro consulta?'});
    }
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`http://node.tconect.xyz:2122/telefone.php?consulta=${encodeURIComponent(consulta)}`);
        const data = await response.json();

        if (!data || !data.sucess || !data.data || data.data.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        key[apikey].request--; // decrementa requests

        res.json({
            criador: "RussoDevs7",
            resultado: data.data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar dados' });
    }
});


app.get('/api/consulta/cep', async (req, res) => {
    const { consulta, apikey } = req.query;

    if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!consulta) {
        return res.status(400).json({ error: 'Cade o parametro consulta?'});
    }
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`http://node.tconect.xyz:2122/cep.php?consulta=${encodeURIComponent(consulta)}`);
        const data = await response.json();

        if (!data || !data.sucesso || !data.pessoas || data.pessoas.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        key[apikey].request--; // decrementa requests

        res.json({
            criador: "RussoDevs7",
            resultado: data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar dados' });
    }
});


app.get('/api/consulta/ip', async (req, res) => {
    const { consulta, apikey } = req.query;

  if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!consulta) 
    return res.status(400).json({ error: "Faltando parâmetro IP" });

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://ipwhois.app/json/${encodeURIComponent(consulta)}`);
        const data = await response.json();

        if (!data || !data.success) {
            return res.status(404).json({ error: "IP não encontrado" });
        }

        key[apikey].request--; // decrementa requests

        res.json({
            criador: "RussoDevs7",
            ip: data.ip,
            tipo: data.type,
            continente: data.continent,
            pais: data.country,
            regiao: data.region,
            cidade: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            isp: data.isp,
            timezone: data.timezone,
            moeda: data.currency,
            simbolo_moeda: data.currency_symbol
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao consultar IP" });
    }
});


app.get('/api/consulta/ddd', async (req, res) => {
    const { consulta, apikey } = req.query;

  if (!apikey) {
     return res.status(429).json({ error: "Cade o parâmetro apikey?" });
    }
    // checa limite de requests
    if (!key[apikey]) {
        return res.sendFile(path.join(__dirname, "./public/apikey_invalida.html"));
    }

    if (!consulta) 
    return res.status(400).json({ error: "Faltando parâmetro consulta" });

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://brasilapi.com.br/api/ddd/v1/${encodeURIComponent(consulta)}`);
        const data = await response.json();

        if (!data || !data.state || !data.cities || data.cities.length === 0) {
            return res.status(404).json({ error: "DDD não encontrado" });
        }

        key[apikey].request--; // decrementa requests

        res.json({
            criador: "RussoDevs7",
            estado: data.state,
            cidades: data.cities
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao consultar DDD" });
    }
});


app.get('/api/consulta/cnpj', async (req, res) => {
    const { consulta, apikey } = req.query;

    if (!apikey) return res.status(400).json({ error: "Faltando apikey" });
    if (!key[apikey]) return res.status(403).json({ error: "Apikey inválida" });
    if (!consulta) return res.status(400).json({ error: "Faltando o CNPJ" });

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://brasilapi.com.br/api/cnpj/v1/${consulta}`);
        const data = await response.json();

        if (!data || !data.cnpj) {
            return res.status(404).json({ error: "CNPJ não encontrado" });
        }

        key[apikey].request--; // Decrementa o uso da chave

        res.json({
            criador: "RussoDevs7",
            cnpj: data.cnpj,
            razao_social: data.razao_social,
            nome_fantasia: data.nome_fantasia || "Não informado",
            situacao: data.descricao_situacao_cadastral,
            natureza_juridica: data.natureza_juridica,
            tipo_logradouro: data.descricao_tipo_de_logradouro,
            logradouro: data.logradouro,
            numero: data.numero,
            bairro: data.bairro,
            municipio: data.municipio,
            estado: data.uf,
            cep: data.cep,
            telefone: data.ddd_telefone_1 || "Não informado",
            email: data.email || "Não informado",
            cnae_principal: data.cnae_fiscal_descricao,
            abertura: data.data_inicio_atividade,
            porte: data.porte,
            mei: data.opcao_pelo_mei ? "Sim" : "Não",
            simples: data.opcao_pelo_simples ? "Sim" : "Não",
            status: data.descricao_situacao_cadastral
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao consultar CNPJ" });
    }
});


//HTML
app.get('/', async (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/suporte', async (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'suporte.html'));
});

app.get('/dash', async (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'dash.html'));
});

app.get('/planos', async (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'planos.html'));
});

app.get('/atualizacao', async (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'atualizacao.html'));
});

app.get('/painel', async (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'adm.html'));
});


app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/public/404.html");
});
//=====FIM ROTAS======\\

//Inicialização do servidor
app.listen(PORT, () => {
console.log(`\n\x1b[36mSERVIDOR RODANDO: HTTP://LOCALHOST:${PORT}\x1b[0m`);
});

fs.watchFile(__filename, () => {
fs.unwatchFile(__filename)
console.log(colorirConsole(`\n%azul%[ INDEX ] %semCor%- A index principal da api foi editada irei reinicia para salvar as alterações 👍`))
process.exit();
})

fs.watchFile('./database/scraper.js', () => {
fs.unwatchFile('./database/scraper.js')
console.log(colorirConsole(`\n%azul%[ SCRAPER ] %semCor%- Os scraper da api foi editada irei reinicia para salvar as alterações 👍`))
process.exit();
})
