// =====================================================================
// LAB 10 - Gerenciamento de venda de carros (Update e Delete)
// (as rotas do Blog do Lab 9 continuam funcionando no final do arquivo)
// =====================================================================

// Abre o "cofre" (.env) - precisa ser a PRIMEIRA linha que roda
require('dotenv').config();

var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

var app = express();

// ===== Conexão com o MongoDB =====
const MongoClient = mongodb.MongoClient;
const uri = process.env.MONGO_URI;            // a string de conexão fica no arquivo .env
const client = new MongoClient(uri, { useNewUrlParser: true });

// ===== Bancos e coleções (gavetas) =====
// Lab 9 - Blog
var blog = client.db("blog");
var posts = blog.collection("posts");

// Lab 10 - Concessionária (item 5.1: duas coleções)
var concessionaria = client.db("concessionaria");
var usuarios = concessionaria.collection("usuarios");   // nome, login, senha
var carros = concessionaria.collection("carros");       // marca, modelo, ano, qtde_disponivel

// ===== Item 3.2: "/" leva para a página de projetos (fica ANTES do static!) =====
app.get('/', function (requisicao, resposta) {
  resposta.redirect('/projetos.html');   // use o nome EXATO do arquivo que está na pasta public
});

// ===== Configurações do Express =====
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');


// =====================================================================
// USUÁRIOS - cadastro e login guardados no BANCO (coleção "usuarios")
// =====================================================================

// Atalhos para as páginas de cadastro e login
app.get('/cadastra', function (requisicao, resposta) {
  resposta.redirect('/Cadastro.html');
});

app.get('/login', function (requisicao, resposta) {
  resposta.redirect('/Login.html');
});

// CREATE - cadastrar usuário
app.post('/cadastro', async function (requisicao, resposta) {
  try {
    var novoUsuario = {
      nome: requisicao.body.nome,
      login: requisicao.body.login,
      senha: requisicao.body.senha
    };

    await usuarios.insertOne(novoUsuario);   // guarda a ficha na gaveta "usuarios"
    resposta.redirect('/login');              // depois de cadastrar, vai para o login
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao cadastrar usuário!" });
  }
});

// READ - login: procura um usuário com ESTE login E ESTA senha
app.post('/login', async function (requisicao, resposta) {
  try {
    var filtro = { login: requisicao.body.login, senha: requisicao.body.senha };
    const items = await usuarios.find(filtro).toArray();

    var liberado = false;
    var nome = '';
    if (items.length > 0) {
      liberado = true;
      nome = items[0].nome;   // items[0] = o primeiro usuário encontrado
    }

    resposta.render('resposta', { liberado: liberado, nome: nome });
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao fazer login!" });
  }
});


// =====================================================================
// CARROS - CRUD completo (coleção "carros")
// =====================================================================

// READ - página de gerência: lista os carros com os botões de ação
app.get('/gerenciar', async function (requisicao, resposta) {
  try {
    const items = await carros.find({}).toArray();   // {} = todos os carros
    resposta.render('gerenciar', { listaCarros: items });
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao carregar os carros!" });
  }
});

// READ - listagem pública dos carros
app.get('/carros', async function (requisicao, resposta) {
  try {
    const items = await carros.find({}).toArray();
    resposta.render('carros', { listaCarros: items });
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao listar os carros!" });
  }
});

// CREATE - cadastrar novo carro
app.post('/cadastrar_carro', async function (requisicao, resposta) {
  try {
    var novoCarro = {
      marca: requisicao.body.marca,
      modelo: requisicao.body.modelo,
      ano: Number(requisicao.body.ano),                          // texto -> número
      qtde_disponivel: Number(requisicao.body.qtde_disponivel)   // texto -> número (essencial para o $inc!)
    };

    await carros.insertOne(novoCarro);
    resposta.redirect('/gerenciar');   // volta para a gerência já mostrando o carro novo
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao cadastrar carro!" });
  }
});

// UPDATE - atualizar ano e quantidade de um carro
app.post('/atualizar_carro', async function (requisicao, resposta) {
  try {
    // QUEM: o carro com este modelo
    var filtro = { modelo: requisicao.body.modelo };
    // O QUÊ: troca só o ano e a quantidade
    var novosDados = {
      $set: {
        ano: Number(requisicao.body.ano),
        qtde_disponivel: Number(requisicao.body.qtde_disponivel)
      }
    };

    const result = await carros.updateOne(filtro, novosDados);
    console.log(result);

    if (result.matchedCount == 0) {
      resposta.render('resposta_carro', { resposta: "Carro não encontrado!" });
    } else {
      resposta.redirect('/gerenciar');
    }
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao atualizar carro!" });
  }
});

// UPDATE especial - VENDER: diminui 1 na quantidade
app.post('/vender_carro', async function (requisicao, resposta) {
  try {
    // QUEM: este modelo, MAS só se ainda tiver estoque ($gt = "maior que")
    var filtro = { modelo: requisicao.body.modelo, qtde_disponivel: { $gt: 0 } };
    // O QUÊ: soma -1 na quantidade ($inc = "incrementar")
    var venda = { $inc: { qtde_disponivel: -1 } };

    const result = await carros.updateOne(filtro, venda);
    console.log(result);

    if (result.matchedCount == 0) {
      // ninguém bateu com o filtro: o carro está com 0 unidades
      resposta.render('resposta_carro', { resposta: "Carro esgotado!" });
    } else {
      resposta.redirect('/gerenciar');   // volta já com a quantidade nova
    }
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao vender carro!" });
  }
});

// DELETE - remover carro
app.post('/remover_carro', async function (requisicao, resposta) {
  try {
    var filtro = { modelo: requisicao.body.modelo };   // nunca deixe o filtro vazio no delete!

    const result = await carros.deleteOne(filtro);
    console.log(result);

    if (result.deletedCount == 0) {
      resposta.render('resposta_carro', { resposta: "Carro não encontrado!" });
    } else {
      resposta.redirect('/gerenciar');
    }
  } catch (err) {
    console.error(err);
    resposta.render('resposta_carro', { resposta: "Erro ao remover carro!" });
  }
});


// =====================================================================
// BLOG (Lab 9) - continua funcionando
// =====================================================================

app.post('/cadastrar_post', function (req, resp) {
  var data = { titulo: req.body.titulo, resumo: req.body.resumo, conteudo: req.body.conteudo };

  posts.insertOne(data, function (err) {
    if (err) {
      console.log(err);
      resp.render('resposta_post.ejs', { resposta: "Erro ao enviar post!" });
    } else {
      resp.render('resposta_post.ejs', { resposta: "Post cadastrado!" });
    }
  });
});

app.get('/blog', function (req, resp) {
  posts.find({}).toArray(function (err, items) {
    if (err) {
      resp.render('resposta_post.ejs', { resposta: "Erro ao listar posts!" });
    } else {
      resp.render('blog.ejs', { listaPosts: items });
    }
  });
});


// ===== Item 3.1: servidor na porta 80 =====
var server = http.createServer(app);
server.listen(80);

console.log('servidor rodando na porta 80...'.rainbow);
