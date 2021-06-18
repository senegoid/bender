const { List } = require("./core")

const ListClients = async (key, baseAtual, name) => {
  const config = {
    apiKey: key,
    base: baseAtual,
    table: "People",
    view: "Client",
    sort: [],
    filterByFormula: name ? `SEARCH("${name}", {Full Name}) != ""` : "",
  }

  return List(config);
}


module.exports = { ListClients };