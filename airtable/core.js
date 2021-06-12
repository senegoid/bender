var Airtable = require('airtable');

const config = {
  apiKey: "",
  baseId: "",
  table: "",
  view: "",
  sort: [],
  filterByFormula: "",
}

const List = async (config) => {
  const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId);
  const objects = [];

  const table = base(config.table)
  const query = table.select({
    view: config.view,
    sort: config.sort,
    filterByFormula: config.filterByFormula,
  })
  const records = await query.all();
  for await (let record of records) {
    objects.push({ id: record.id, ...record._rawJson.fields });
  }
  return objects;
}

module.exports = { List }