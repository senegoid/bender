var Airtable = require('airtable');

const ListCoaches = async (key, baseAtual, name = null) => {
  const base = new Airtable({ apiKey: key }).base(baseAtual);
  const coaches = [];
  const filterByFormula = name ? `SEARCH("${name}", {Full Name}) != ""` : ""

  const table = base('People')
  const query = table.select({
    view: "Coaches",
    filterByFormula: filterByFormula,
  })
  const records = await query.all();
  for await (let record of records) {
    coaches.push({ id: record.id, ...record._rawJson.fields });
  }
  return coaches;
}

const ListClients = async (key, baseAtual) => {
  const base = new Airtable({ apiKey: key }).base(baseAtual);
  const clients = [];

  const table = base('People')
  const query = table.select({
    view: "Client",
    sort: [{ field: "Coach", direction: "desc" }],
    filterByFormula: "NOT({Coach} = '')"
  })
  const records = await query.all();
  for await (let record of records) {
    clients.push({ id: record.id, ...record._rawJson.fields });
  }
  return clients;
}


module.exports = { ListCoaches, ListClients };