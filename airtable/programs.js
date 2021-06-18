const { List } = require("./core")

const ListPrograms = async (key, baseAtual) => {
  const config = {
    apiKey: key,
    base: baseAtual,
    table: "Programs",
    view: "",
    sort: [],
    filterByFormula: "",
  }
  return List(config);
}

module.exports = { ListPrograms };