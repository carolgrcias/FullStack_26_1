
let numeroSecreto = Math.floor(Math.random() * 100);

function verificarPalpite() {

    let palpite = Number(document.getElementById("palpite").value);

    if (palpite < 0 || palpite > 99 || document.getElementById("palpite").value === "") {
        document.getElementById("mensagem").innerHTML = "Digite um número entre 0 e 99!";
        return;
    }

    if (palpite > numeroSecreto) {
        document.getElementById("mensagem").innerHTML = "O número secreto é menor!";
        document.getElementById("mensagem").style.setProperty("background-color", "red");
    }

    else if (palpite < numeroSecreto) {
        document.getElementById("mensagem").innerHTML = "O número secreto é maior!";
        document.getElementById("mensagem").style.setProperty("background-color", "red");
    }

    else {
        document.getElementById("mensagem").innerHTML = "Parabéns! Você acertou!";
        document.getElementById("mensagem").style.setProperty("background-color", "lightgreen");
    }
}
