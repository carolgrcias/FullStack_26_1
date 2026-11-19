require('dotenv').config();   // abre o cofre (.env)

var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

var app = express();

// ===== 3. Conectar ao MongoDB =====
const MongoClient = mongodb.MongoClient;
const uri = process.env.MONGO_URI;   // pega a string de dentro do cofre
const client = new MongoClient(uri, { useNewUrlParser: true });

// ===== 4. Abrir o banco e a collection =====
var blog = client.db("blog");          // abre (ou cria) o armário
var posts = blog.collection("posts");  // abre (ou cria) a gaveta

// "/" leva para a página de projetos (ATENÇÃO: fica ANTES do static!)
app.get('/', function (requisicao, resposta) {
  resposta.redirect('/projetos.html');
});

app.get('/', function(req, resp){
    resp.redirect('/projetos.html')
});

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');


app.get('/cadastra', function (requisicao, resposta) {
  resposta.redirect('/Cadastro.html');
});

app.get('/login', function(requisicao, resposta){
    resposta.redirect('/Login.html');
})

// LISTA USUARIOS
var usuarios = []

app.post('/cadastro', function(requisicao, resposta){
    var nome = requisicao.body.nome;
    var login = requisicao.body.login;
    var senha = requisicao.body.senha;

    usuarios.push({nome, login, senha});
    console.log(usuarios);

    resposta.redirect('/login');        // depois de cadastrar, vai para o login
})

app.post('/login', function(requisicao, resposta){
    var login = requisicao.body.login;
    var senha = requisicao.body.senha;

    var liberado = false;
    var nome = '';

    for (var i = 0; i < usuarios.length; i++){
        if (usuarios[i].login == login && usuarios[i].senha == senha) {
            liberado = true;
            nome = usuarios[i].nome;
        }
    }

    resposta.render('resposta', {liberado, nome});
});
// FIM LISTA USUARIOS

app.post("/cadastrar_post", function (req, resp) {
    // 1. Monta a "ficha" com o que veio do formulário
  var data = { titulo: req.body.titulo, resumo: req.body.resumo, conteudo: req.body.conteudo };

    // 2. Coloca a ficha na gaveta
  posts.insertOne(data, function (err) {
    // 3. Quando o banco termina, ele "liga de volta" aqui
    if (err) {
      console.log(err);
      resp.render("resposta_post.ejs", { resposta: "Erro ao enviar post!" });
    } else {
      resp.render("resposta_post.ejs", { resposta: "Post cadastrado!" });
    }
  });
});

app.get("/blog", function (req, resp) {
  // 1. Filtro vazio {} = "me traga TODOS os produtos"
  posts.find({}).toArray(function (err, items) {
    console.log(items);
    if (err) {
      resp.render("resposta_post.ejs", { resposta: "Erro ao listar posts!" });
    } else {
      // 2. Manda a lista inteira para a página
      resp.render("blog.ejs", { listaPost: items });
    }
  });
});



var server = http.createServer(app);
server.listen(80);   // Item 3.1: porta 80

console.log('servidor rodando na porta 80...'.rainbow);