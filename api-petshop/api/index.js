const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const config = require('config')
const NaoEncontrado = require('./erros/NaoEncontrado')
const CampoInvalido = require('./erros/CampoInvalido')
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')

const formatosAceitos = require('./Serializador').formatosAceitos
const roteador = require('./rotas/fornecedores')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado')

app.use(bodyParser.json())

app.use((requisicao, resposta, proximo) => {
    let formatoRequisitado = requisicao.header('Accept')
    if (formatoRequisitado === "*/*") {
        formatoRequisitado = "application/json"
    }
    if (formatosAceitos.indexOf(formatoRequisitado) === -1) {
        resposta.status(406)
        resposta.end()
        return
    }

    resposta.setHeader('Content-Type', formatoRequisitado)
    proximo()
})

app.use('/api/fornecedores', roteador)

app.use((erro, requisicao, resposta, proximo) => {
    let status = 500
    if (erro instanceof NaoEncontrado) {
        status = 404
    } else if (erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos) {
        status = 400
    } else if (erro instanceof ValorNaoSuportado) {
        status = 406
    }
    resposta.status(status)
    resposta.send(JSON.stringify({ mensagem: erro.message, id: erro.idErro }))
})

app.listen(config.get('api.port'), () => {
    console.log('A API esta funcionando')
})