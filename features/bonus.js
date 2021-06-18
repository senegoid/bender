// Description:
//   Script para controle de peer bonus entre colaboradores
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   (bônus doar) +<credito> @usuario #<valor> -> Exemplo: +10 para o @fulano por ter demonstrado #responsabilidade
//   (bônus saldos) @bender <mostra|mostre|diga|fala|veja> meu(s) saldo(s)
//   (bônus saldos) @bender mostre todos saldos de bônus
//   (bônus resgate) @bender <quero|favor> <resgate|resgatar|resgata> <valor> <para|por causa|pra> <descrever o motivo> -> Exemplo: @bender resgate 3 para comprar um sorvete.
//   (bônus resgate) @bender resgates feitos pelo @fulano
//   (bônus detalhes) @bender (mostra|mostre|diga|fala|veja) os bônus que o @<usuario> (deu|distribuíu)
//   (bônus detalhes) @bender (mostra|mostre|diga|fala|veja) os bônus que o @<usuario> (ganhou|recebeu)
//   (bônus adm Recarga) @bender recarregar o saldo do bônus com <valor>
//   (bônus adm Análise de pedidos) @bender analisar resgates de bônus
//   (bônus adm permissao) @bender (mude|mudar) o @<usuario> para admin
//
//
// Author:
//   @senegoid
require('dotenv').config();
const { random } = require('lodash');
const _ = require("lodash");
const { CreateUsers, ListUsers, Distribute, UpdateBonus } = require("../airtable/bonus");

const values = ['#TeamPlay', '#Creativity', '#Resilience', '#Leadership', '#Empowerment'];

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;
  const rValues = values.join("|");
  const give = `\\+([0-9]+)(.*)<@(.*)>(.*)(${rValues})`;

  controller.hears(new RegExp(give, 'i'), 'direct_message', async (bot, message) => {
    const payload = {
      bot,
      message,
      key,
      user: message.user,
      recipient: message.matches[3],
      amount: message.matches[1] * 1,
      compliment: message.matches[5],
      text: message.text,
    }
    GiveBonus(payload);
    return true;
  });

  const GiveBonus = async ({ bot, message, key, user, recipient, amount, compliment, text }) => {
    await bot.changeContext(message.reference)
    await bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });

    if (user === recipient) {
      bot.reply(message, "You can't give it to yourself");
      return true;
    }

    let users;
    try {
      users = await controller.storage.read([`${message.team}_users`]);
      if (users[`${message.team}_users`]) {
        users = users[`${message.team}_users`];
        team = await controller.storage.read([message.team]);
        if (team[message.team]) {
          team = team[message.team];
          if (team.airtableBaseBonus) {
            let usersBonus = await ListUsers({ key, base: team.airtableBaseBonus })
            usersBonus = _.keyBy(usersBonus, "id");

            if (!users[user] || !users[user].airtableID || !usersBonus[users[user].airtableID]) {
              bot.reply(message, "How should I tell you... You are not in the Bonus Database yet");
              return true;
            }
            const userGive = usersBonus[users[user].airtableID];

            if (!users[recipient] || !users[recipient].airtableID || !usersBonus[users[recipient].airtableID]) {
              bot.reply(message, "For this person it's not possible, they is not on the Bonus.");
              return true;
            }
            const userReceive = usersBonus[users[recipient].airtableID];

            //verify balance of user
            if (userGive["Amount to Distribute"] < amount) {
              bot.reply(message, "Bro you're broke, no balance for it!");
              return true;
            }

            //decrease the donated amount to ditribute
            //user--
            const decrease = {
              id: userGive.id,
              fields: {
                ["Amount to Distribute"]: userGive["Amount to Distribute"] - amount
              }
            }

            //Register increase the donated of Amount Received
            //recipient++
            // Add value on array
            let receiveValues = userReceive.Compliments || []
            receiveValues.push(compliment);
            receiveValues = _.uniq(receiveValues);

            const increase = {
              id: userReceive.id,
              fields: {
                ["Amount Received"]: userReceive["Amount Received"] + amount,
                Compliments: receiveValues
              }
            }

            await UpdateBonus({ key, base: team.airtableBaseBonus, values: [decrease, increase] })

            //publish on channel bonus            
            await bot.say({ channel: 'bonus', text: `${userGive.Name} gave: \n   ${message.text}` })


          }
          else {
            bot.reply(message, "Your team does not have a Bonus database set up yet.");
            return true;
          }
        }
      }
    }

    catch (error) {
      bot.reply(message, error.toString());
    }

  }

  controller.hears('sync user bonus', 'direct_message', async (bot, message) => {
    InsertUserBonus({ bot, message, key });
    return true;
  });

  const InsertUserBonus = async ({ bot, message, key }) => {
    await bot.changeContext(message.reference)
    await bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    let users;
    try {
      users = await controller.storage.read([`${message.team}_users`]);
      let user = {}
      if (users[`${message.team}_users`]) {
        team = await controller.storage.read([message.team]);
        if (team[message.team]) {
          team = team[message.team];
          if (team.airtableBaseBonus) {
            const usersAirtable = await ListUsers({ key, base: team.airtableBaseBonus })

            users = users[`${message.team}_users`];
            users = _.pickBy(users, (u) => u.profile && u.profile.real_name !== "Slackbot");
            users = _.pickBy(users, (u) => !u.airtableID || usersAirtable.find((row) => row.id === u.airtableID) === undefined);
            const inserted = await CreateUsers({ key, base: team.airtableBaseBonus, users });
            if (inserted) {
              users = await controller.storage.read([`${message.team}_users`]);
              users = users[`${message.team}_users`];
              for await (let record of inserted) {
                users[record._rawJson.fields.SlackID].airtableID = record._rawJson.id;
                users[record._rawJson.fields.SlackID].updateAt = Date();
              }
              controller.storage.write({ [`${message.team}_users`]: users });
            }
            bot.reply(message, "Done.");
          }
        }
      }
    }
    catch (error) {
      bot.reply(message, error.toString());
    }

  }

  controller.hears(new RegExp(/distribute ([0-9]+)/i), 'direct_message', async (bot, message) => {
    const payload = {
      bot,
      message,
      key,
      distribute: message.matches[1] * 1,
    }
    DistributeBonus(payload);
    return true;
  });

  const DistributeBonus = async ({ bot, message, key, distribute }) => {
    await bot.changeContext(message.reference)
    await bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    let users;
    try {
      users = await controller.storage.read([`${message.team}_users`]);
      if (users[`${message.team}_users`]) {
        team = await controller.storage.read([message.team]);
        if (team[message.team]) {
          team = team[message.team];
          if (team.airtableBaseBonus) {
            const result = await Distribute({ key, base: team.airtableBaseBonus, value: distribute })
            bot.reply(message, "Done.");
          }
        }
      }
    }
    catch (error) {
      bot.reply(message, error.toString());
    }
  }

  controller.hears(new RegExp(/redeem ([0-9]+)/i), 'direct_message', async (bot, message) => {
    const payload = {
      bot,
      message,
      key,
      redeem: message.matches[1] * 1,
    }
    RedeemBonus(payload);
    return true;
  });

  const RedeemBonus = async ({ bot, message, key, redeem }) => {
    await bot.changeContext(message.reference)
    await bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    let users;
    try {
      users = await controller.storage.read([`${message.team}_users`]);
      if (users[`${message.team}_users`]) {
        team = await controller.storage.read([message.team]);
        if (team[message.team]) {
          team = team[message.team];
          if (team.airtableBaseBonus) {
            const user = message.user;
            users = users[`${message.team}_users`];
            let usersBonus = await ListUsers({ key, base: team.airtableBaseBonus })
            usersBonus = _.keyBy(usersBonus, "id");

            if (!users[user] || !users[user].airtableID || !usersBonus[users[user].airtableID]) {
              bot.reply(message, "How should I tell you... You are not in the Bonus Database yet");
              return true;
            }
            const userRedeem = usersBonus[users[user].airtableID];

            if (userRedeem["Amount Received"] < redeem) {
              bot.reply(message, "Dude, you don't have the balance for this!");
              return true;
            }

            const payloadRedeem = {
              id: userRedeem.id,
              fields: {
                ["Amount Received"]: userRedeem["Amount Received"] - redeem,
                ["Amount Redeemed"]: userRedeem["Amount Redeemed"] + redeem,
              }
            }

            const result = await UpdateBonus({ key, base: team.airtableBaseBonus, values: [payloadRedeem] })

            bot.reply(message, "Done.");
          }
          else {
            bot.reply(message, "Your team does not have a Bonus database set up yet.");
            return true;
          }
        }
      }
    }
    catch (error) {
      bot.reply(message, error.toString());
    }
  }
}
