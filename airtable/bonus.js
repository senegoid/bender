const { update } = require("lodash");
const _ = require("lodash");
const { List, Create, Update } = require("./core")


const Distribute = async ({ key, base, value }) => {
  const users = await ListUsers({ key, base });

  let payload = users.map((u) => {
    return {
      id: u.id,
      fields: {
        ["Amount to Distribute"]: value,
      }
    }
  });
  await Update({ apiKey: key, base, table: "Bonus", records: payload });
}

const Give = async ({ key, base, values }) => {
  await Update({ apiKey: key, base, table: "Bonus", records: values });
}



const ListUsers = async ({ key, base }) => {

  const config = {
    apiKey: key,
    base,
    table: "Bonus",
    view: "",
    sort: [],
    filterByFormula: "",
  }
  return List(config);
}

const CreateUsers = async ({ key, base, users }) => {
  //if (dont have regs)
  delete users.eTag;
  const usersKeys = _.keysIn(users);
  if (usersKeys.length > 0) {
    let insert = usersKeys.map((u) => {
      return {
        fields: {
          Name: users[u].profile.real_name,
          ["Amount to Distribute"]: 0,
          ["Amount Received"]: 0,
          Compliments: [],
          ["Amount Redeemed"]: 0,
          SlackID: users[u].id,
          SlackEmail: users[u].profile.email
        }
      }
    });
    const inserted = await Create({ apiKey: key, base, table: "Bonus", records: insert });
    return inserted;
  }
  return null
}


const Redeem = async (key, base, users) => {

}

module.exports = { Distribute, CreateUsers, ListUsers, Give }