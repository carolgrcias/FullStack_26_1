var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');

var app = express();

// "/" leva para a página de projetos (ATENÇÃO: fica ANTES do static!)
app.get('/', function (requisicao, resposta) {
  resposta.redirect('/projetos.html');
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

var server = http.createServer(app);
server.listen(80);   // Item 3.1: porta 80

console.log('servidor rodando na porta 80...'.rainbow);