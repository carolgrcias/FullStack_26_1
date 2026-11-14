// =====================================================
//  Servidor WEB do meu site - Node.js + Express
// =====================================================

const express = require("express");
const path = require("path");
const os = require("os");

const app = express();

// O servidor funciona na porta 80
const PORTA = 80;

// Pasta onde ficam todas as páginas do site
const PASTA_SITE = path.join(__dirname, "public");

//  Adiciona TODAS as páginas do site ao servidor
// (todos os .html, .css, .js e imagens que estiverem na pasta "public")
app.use(express.static(PASTA_SITE));

// Quem digitar só o IP (http://<ip>/) é levado para a Home
app.get("/", function (req, res) {
    res.redirect("/Home.html");
});

// qlqr endereço que não existe mostra uma página de erro 404
app.use(function (req, res) {
    res.status(404).send(
        "<h1>404 - Página não encontrada</h1>" +
        "<a href='/Home.html'>Voltar para a Home</a>"
    );
});

// "0.0.0.0" = aceita acessos de OUTROS computadores da msma rede
const servidor = app.listen(PORTA, "0.0.0.0", function (erro) {
    if (erro) {
        return; // o erro e tratado lá embaixo, em servidor.on("error")
    }

    console.log("Servidor rodando na porta " + PORTA);
    console.log("");
    console.log("Neste computador:  http://localhost/Home.html");
    console.log("");
    console.log("Em outros computadores da rede, use:");

    // Mostra o IP deste computador (o mesmo que aparece no ipconfig)
    const redes = os.networkInterfaces();
    for (const nome in redes) {
        for (const rede of redes[nome]) {
            if (rede.family === "IPv4" && !rede.internal) {
                console.log("  http://" + rede.address + "/Home.html   (" + nome + ")");
            }
        }
    }

    console.log("");
    console.log("Para desligar o servidor, aperte Ctrl + C");
});


servidor.on("error", function (erro) {
    if (erro.code === "EADDRINUSE") {
        console.log("ERRO: a porta 80 já está sendo usada por outro programa.");
        console.log("Feche programas como XAMPP, Apache, IIS ou Skype e tente de novo.");
    } else if (erro.code === "EACCES") {
        console.log("ERRO: sem permissão para usar a porta 80.");
        console.log("Abra o Prompt de Comando como Administrador e tente de novo.");
    } else {
        console.log("ERRO:", erro.message);
    }
});
