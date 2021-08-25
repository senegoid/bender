
const obrigado = [
  "Obrigado você!",
  "sem problema",
  "nenhum problema",
  "nenhum problema com isso.",
  "nada não!",
  "que isso mano",
  "o prazer foi meu",
  "meu prazer",
  "de nada",
  "nem pense nisso",
  "não, não. Obrigado você!",
  "tudo certo"
];

const bomdia = [
  "Bom dia pra você!",
  "Bom dia!!!",
  "Bom dia.",
  "Buenos dias.",
  "Bom dia pra você. Bom dia vida. Bom dia trabalho",
  "Que Deus nos conceda um dia abençoado e cheio de vitórias! Bom dia!",
  "Bom dia! Que a cada manhã, você sinta em seu coração a certeza de que a vida lhe espera de braços abertos, para receber suas expectativas e realizá-las uma a uma.",
  "Bom dia! Mantenha o foco no objetivo, centralize a força para lutar e utilize a fé para vencer.",
  "Tenha um bom dia, uma semana fantástica e uma vida maravilhosa.",
  "Bom dia, alegria!",
  "Bom dia. Um elogio sincero pode mudar o seu dia, que tal mudar o dia de alguém hoje?",
  "Bom dia. Faça o melhor que puder. Seja o melhor que puder. O resultado virá na mesma proporção de seu esforço."
]

const boatarde = [
  "Boa tarde pra você!",
  "Boa tarde!!!",
  "Boa tarde.",
  "Boa tarde pra você. Boa tarde vida. Boa tarde a todos.",
  "Que Deus nos conceda uma tarde abençoada e cheio de vitórias! Boa tarde!",
  "Boa tarde! Que a cada dia, você sinta em seu coração a certeza de que a vida lhe espera de braços abertos, para receber suas expectativas e realizá-las uma a uma.",
  "Boa tarde! Mantenha o foco no objetivo, centralize a força para lutar e utilize a fé para vencer.",
  "Tenha uma boa tarde, uma semana fantástica e uma vida maravilhosa.",
  "Boa tarde, alegria!",
  "Boa tarde. Um elogio sincero pode mudar o seu dia, que tal mudar o dia de alguém hoje?",
  "Boa tarde. Faça o melhor que puder. Seja o melhor que puder. O resultado virá na mesma proporção de seu esforço."
];

const boanoite = [
  "Boa noite pra você!",
  "Boa noite!!!",
  "Boa noite.",
  "Boa noite pra você. Boa noite vida. Boa noite a todos.",
  "Que Deus nos conceda uma noite abençoada e cheia de vitórias! Boa noite!",
  "Boa noite! Que a cada dia, você sinta em seu coração a certeza de que a vida lhe espera de braços abertos, para receber suas expectativas e realizá-las uma a uma.",
  "Boa noite! Mantenha o foco no objetivo, centralize a força para lutar e utilize a fé para vencer.",
  "Tenha uma boa noite, uma semana fantástica e uma vida maravilhosa.",
  "Boa noite, alegria!",
  "Boa noite. Um elogio sincero pode mudar o seu dia, que tal mudar o dia de alguém amanhã?",
  "Boa noite. Faça o melhor que puder. Seja o melhor que puder. O resultado virá na mesma proporção de seu esforço."
];

const maldade = [
  "programar...",
  "Fazer try-catch 'cala-boca', style-inline...",
  "Dar update sem where, delete sem where...",
  "Apagar o banco, deletar o backup...",
  "Fazer while(true), programar em Python e PHP...",
  "Dar commit com bug...",
  "fazer duas horas de almoço...",
  "Ficar o dia inteiro no facebook enquanto os chamados estão bombando...",
  "Acessar o 'Não-intendo', (<não dá pra entender>) developer...",
  "usar o IE, Jogar CS na rede do trampo...",
  "Aceitar proposta de trabalho pra ganhar menos...",
  "comprar Nokia Lumia...",
  "Fazer format c:",
  "Jogar LOL, clicar no 'foto.exe'...",
  "Abrir os spam...",
  "rasgar os casos de uso...",
  "Mandar o Gerente de projetos se fuder...",
  "Cumprir prazo é o caralho...",  
  "Comprar um Mac e instalar Windows...",
  "Apagar a 'system32'",
  "Consertar as impressoras, formatar o pc do tio...",
  "perguntar se o funcionário não tem trampo... Ameaçar mandar ele ir embora...",
  "Atrasar o salário, prometer aumento e não dar aumento, chegar atrasado...",
  "Dar comida de rabo, levar comida de rabo...",
  "agendar a apresentação pra segunda de manhã...",
  "Dormir na reunião após o almoço...",
  "Fazer site no WIX...",
  "Falar pra mulher que você vai sair com os amigos mas na verdade você vai programar...",
  "não atender chamado, deixar os clientes esperando na linha...",
  "Instalar o Baidu... Tentar desinstalar o Baidu...",
  "dar pau no PC, foder com os ponteiros no C...",
  "Falar que 'na minha máquina funciona'...",
  "Ficar com o fone de ouvido sem ouvir música..."  
];

module.exports = function (controller) {

  controller.hears(['bom dia'], 'message,direct_message', async (bot, message) => {
    await bot.reply(message, bomdia[Math.floor(Math.random() * bomdia.length)]);
  });

  controller.hears(['boa tarde'], 'message,direct_message', async (bot, message) => {
    await bot.reply(message, boatarde[Math.floor(Math.random() * boatarde.length)]);
  });
  
  controller.hears(['boa noite'], 'message,direct_message', async (bot, message) => {
    await bot.reply(message, boanoite[Math.floor(Math.random() * boanoite.length)]);
  });

}