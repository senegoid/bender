const versao = require('../../delta/versao');

module.exports = function(controller) {

  // 
  controller.hears(['versao','versão','versoes','versões'], 'direct_message', function(bot, message) {
    versao.gerarVersoes(bot, message);

  });

}