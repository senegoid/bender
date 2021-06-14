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


const values = ['TeamPlay', 'Criativity', 'Resilience', 'Leadership', 'Empowerment'];
require('dotenv').config();

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;
  const rValues = values.join("|");
  const give = `\\+([0-9]+)(.*)<@(.*)>(.*)(${rValues})`;

  controller.hears(new RegExp(give, 'i'), 'message,direct_message', async (bot, message) => {
    const payload = {
      bot,
      message,
      key,
      user: message.user,
      recipient: message.matches[3],
      amount: message.matches[1] * 1,
      value: message.matches[5],
      text: message.text,
    }
    ProcessBonus(payload);
  });

  const ProcessBonus = async ({ bot, message, key }) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });

    // <#C0232590PMM|teste-de-bots>'
    await bot.say({ channel: 'teste-de-bots', text: "Eu acho que vi um bônuszinho." })
  }



}
