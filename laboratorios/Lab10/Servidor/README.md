# Lab 10 - BD - Update e Delete

Sistema de gerenciamento de venda de carros com Node.js, Express, EJS e MongoDB.

## Como rodar

1. Instale as dependências: `npm install`
2. Crie um arquivo `.env` (use o `.env.example` como modelo) com a sua string de conexão do MongoDB
3. Rode: `node servidor.js`
4. Acesse: `http://localhost` (porta 80)

## Banco de dados

Banco `concessionaria`, com duas coleções:

- **usuarios**: `nome`, `login`, `senha`
- **carros**: `marca`, `modelo`, `ano`, `qtde_disponivel`

## Rotas

| Rota | Operação | O que faz |
|---|---|---|
| `POST /cadastro` | Create | Cadastra um usuário |
| `POST /login` | Read | Procura o usuário pelo login e senha |
| `POST /cadastrar_carro` | Create | Cadastra um carro |
| `GET /carros` | Read | Lista os carros (página pública) |
| `GET /gerenciar` | Read | Lista os carros com as ações de gerência |
| `POST /atualizar_carro` | Update | Atualiza o ano e a quantidade de um carro (`$set`) |
| `POST /vender_carro` | Update | Diminui 1 na quantidade (`$inc`), só se a quantidade for maior que 0 (`$gt`) |
| `POST /remover_carro` | Delete | Remove um carro |

## Páginas dinâmicas (EJS) - mostram informações do banco

- `views/carros.ejs`: lista todos os carros e mostra **Esgotado** quando a quantidade é 0
- `views/gerenciar.ejs`: lista os carros com os botões de vender e remover, e monta a lista de opções do formulário de atualizar a partir do banco
- `views/resposta.ejs`: mostra o resultado do login (com o nome do usuário vindo do banco)
- `views/resposta_carro.ejs`: mostra o resultado das operações com carros

## Páginas estáticas (HTML) - conteúdo fixo

- `public/Cadastro.html`: formulário de cadastro de usuário
- `public/Login.html`: formulário de login
