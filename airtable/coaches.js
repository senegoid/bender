var Airtable = require('airtable');

const ListCoaches = async (key, baseAtual) => {
  const base = new Airtable({apiKey: key}).base(baseAtual);
  const coaches = [];

  const table = base('People')
  const query = table.select({
    maxRecords: 100,
    view: "Coaches",
  })
  const records = await query.all();
  for await (let record of records) {
    coaches.push({FullName: record.get('Full Name'), Email: record.get('Email')})
  }    
  console.log(coaches);
  return coaches;
}

module.exports = ListCoaches;