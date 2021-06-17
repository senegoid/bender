var Airtable = require('airtable');

const List = async ({ apiKey, base, table, view, sort, filterByFormula }) => {
  const baseAirTable = new Airtable({ apiKey }).base(base);
  const objects = [];

  const tableAirTable = baseAirTable(table)
  const query = tableAirTable.select({
    view: view,
    sort: sort,
    filterByFormula: filterByFormula,
  })
  const records = await query.all();
  for await (let record of records) {
    objects.push({ id: record.id, ...record._rawJson.fields });
  }
  return objects;
}

const Create = async ({ apiKey, base, table, records }) => {
  const baseAirTable = new Airtable({ apiKey }).base(base);
  const ids = await baseAirTable(table).create(records);
  return ids;
}

const Find = async ({ apiKey, base, table, id }) => {
  const baseAirTable = new Airtable({ apiKey }).base(base);
  const record = await baseAirTable(table).find(id)
  return record;
};



const Update = async ({ apiKey, base, table, records }) => {
  const baseAirTable = new Airtable({ apiKey }).base(base);
  const ids = await baseAirTable(table).update(records);
  return ids;
}

const Delete = async ({ apiKey, base, table, id }) => {
  //destroy is an array of up to 10 record IDs to delete.
  const baseAirTable = new Airtable({ apiKey }).base(base);
  const ids = await baseAirTable(table).destroy(id);
  return ids;
}



module.exports = { List, Create, Find, Update, Delete }