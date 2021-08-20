var fetch = require('node-fetch')

exports.DateFromString = function (str) {
  var parms = str.split(/[\.\-\/]/)
  var yyyy = parseInt(parms[2], 10)
  var mm = parseInt(parms[1], 10)
  var dd = parseInt(parms[0], 10)
  var date = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0)
  if (isNaN(date)) return null
  else return date
}

exports.getTextWiki = async function (endereco) {
  var resp = await fetch(endereco + '&wiki=2')
  var texto = await resp.text()
  return texto
}

exports.getJsonRel = async function (endereco) {
  var resp = await fetch(endereco + '&json=1')
  var obj = await resp.json()
  return obj
}

exports.getText = async function (endereco) {
  var resp = await fetch(endereco)
  var texto = await resp.text()
  return texto
}

exports.getJson = async function (endereco, config) {
  var resp = await fetch(endereco, config)
  var j = await resp.json()
  return j
}


