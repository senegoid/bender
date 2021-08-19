// Author:
//   @senegoid
const fetch = require('node-fetch')
const chamado = require('./chamado')
require('dotenv').config();

// objeto modelo de novo chamado
const nc = {
  topico: '',
  assunto: '',
  descricao: '',
  tipo: '14',
  tec_resp: '0014',
  produto: '',
  pontos: 5,
  funcionalidade: 13186,
  user: 'bender',
  interno: '1',
  data_max: null,
  sprint: 1
}

exports.gerarVersoes = async (msg) => {
  const res = await fetch(process.env.URL_SPRINT)
  const data = await res.json()
  if (data.dados) {
    const ref = data.dados
    for (let i = 0, len = ref.length; i < len; i++) {
      const versao = ref[i]
      msg.channel.send(` ______ Encontrei ${versao.fazer} chamados do produto ${versao.produto}, mas ainda não tem versão dia ${versao.datan}.`)
      nc.data_max = versao.datan
      nc.produto = (versao.codigo > 10 ? `0${versao.codigo}` : versao.codigo)
      nc.pontos = 5 // força para que os pontos sejam sempre 5
      if (parseInt(versao.codigo) === 1) {
        nc.pontos = 13
      }
      nc.assunto = `Atividade: Release Produto ${versao.produto}`
      nc.descricao = `Gerar novo release do sistema ${versao.produto} com as novas funcionalidades. Se possível atualizando as notas de versão do produto.`
      // parâmetros: topico, assunto, descricao, tipo, tec_resp, produto, pontos, funcionalidade, user
      const novoChamado = await chamado.novo(nc.topico, nc.assunto, nc.descricao, nc.tipo, nc.tec_resp, nc.produto, nc.pontos, nc.funcionalidade, nc.user, nc.interno, nc.data_max, nc.sprint)
      if (novoChamado) {
        msg.channel.send(` ______${novoChamado.dados}.`)
      }
    }
  }
  msg.channel.send('__ok__')
}
