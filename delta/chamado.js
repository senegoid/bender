
const conversores = require('./conversores')
require('dotenv').config();
/* eslint-disable camelcase */
exports.novo = async function (topico, assunto, descricao, tipo, tec_resp, produto, pontos, funcionalidade, user, interno = 0, data_max = '', sprint = 0) {
  console.log(`

  parâmetros do novo chamado:
    topico: ${topico},
    assunto: ${assunto},
    descricao: ${descricao},
    tipo: ${tipo},
    tec_resp: ${tec_resp},
    produto: ${produto},
    pontos: ${pontos},
    funcionalidade: ${funcionalidade},
    user: ${user}

    `)

  const FormData = require('form-data')
  const form = new FormData()
  form.append('topico', topico)
  form.append('assunto', assunto)
  form.append('descricao', descricao)
  form.append('tipo', tipo)
  form.append('tec_resp', tec_resp)
  form.append('produto', produto)
  form.append('pontos', pontos)
  form.append('funcionalidade', funcionalidade)
  form.append('user', user)
  form.append('cronograma', 1)
  form.append('interno', interno)
  form.append('data_max', data_max)
  form.append('sprint', sprint)

  const config = { method: 'POST', body: form, headers: form.getHeaders() }
  return conversores.getJson(process.env.URL_CHAMADO, config)
}

// this.novo('', 'Problema: Chamados repovados do Douglas no produto Delta S.G.E. 3.0', 'Chamado teste que será arquivado', '22', '0115', '39', '5', 1979, 'bender', '1')
