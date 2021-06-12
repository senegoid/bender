const { List } = require("./core")


const ListCoaches = async (key, baseAtual, name = null) => {
  const config = {
    apiKey: key,
    baseId: baseAtual,
    table: "People",
    view: "Coaches",
    sort: [],
    filterByFormula: name ? `SEARCH("${name}", {Full Name}) != ""` : "",
  }
  return List(config);
}

const ListClients = async (key, baseAtual) => {

  const config = {
    apiKey: key,
    baseId: baseAtual,
    table: "People",
    view: "Client",
    sort: [{ field: "Coach", direction: "desc" }],
    filterByFormula: "NOT({Coach} = '')",
  }
  return List(config);
}


module.exports = { ListCoaches, ListClients };