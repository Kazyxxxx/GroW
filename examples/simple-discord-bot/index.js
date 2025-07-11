const { Client, GatewayIntentBits, Events } = require('discord.js');

// Créer une nouvelle instance du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Événement quand le bot est prêt
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Bot connecté en tant que ${readyClient.user.tag}!`);
    console.log(`🤖 Bot actif sur ${readyClient.guilds.cache.size} serveur(s)`);
    
    // Définir le statut du bot
    client.user.setActivity('🎮 !help pour les commandes', { type: 'PLAYING' });
});

// Événement pour les messages
client.on(Events.MessageCreate, message => {
    // Ignorer les messages du bot lui-même
    if (message.author.bot) return;
    
    // Vérifier si le message commence par !
    if (!message.content.startsWith('!')) return;
    
    // Extraire la commande et les arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    console.log(`📝 Commande reçue: ${command} par ${message.author.tag}`);
    
    // Commandes disponibles
    switch (command) {
        case 'ping':
            const ping = Date.now() - message.createdTimestamp;
            message.reply(`🏓 Pong! Latence: ${ping}ms`);
            break;
            
        case 'help':
            const helpEmbed = {
                color: 0x7289da,
                title: '🤖 Commandes disponibles',
                description: 'Voici la liste des commandes que vous pouvez utiliser :',
                fields: [
                    {
                        name: '!ping',
                        value: 'Affiche la latence du bot',
                        inline: true,
                    },
                    {
                        name: '!help',
                        value: 'Affiche cette aide',
                        inline: true,
                    },
                    {
                        name: '!info',
                        value: 'Informations sur le bot',
                        inline: true,
                    },
                    {
                        name: '!salut',
                        value: 'Le bot vous salue',
                        inline: true,
                    },
                    {
                        name: '!joke',
                        value: 'Raconte une blague',
                        inline: true,
                    },
                    {
                        name: '!roll [nombre]',
                        value: 'Lance un dé (1-6 par défaut)',
                        inline: true,
                    },
                ],
                footer: {
                    text: 'Bot hébergé sur Discord Bot Hosting Platform',
                },
                timestamp: new Date(),
            };
            message.reply({ embeds: [helpEmbed] });
            break;
            
        case 'info':
            const infoEmbed = {
                color: 0x00ff00,
                title: '📊 Informations du Bot',
                fields: [
                    {
                        name: '🤖 Nom',
                        value: client.user.tag,
                        inline: true,
                    },
                    {
                        name: '🆔 ID',
                        value: client.user.id,
                        inline: true,
                    },
                    {
                        name: '📅 Créé le',
                        value: client.user.createdAt.toLocaleDateString('fr-FR'),
                        inline: true,
                    },
                    {
                        name: '🌐 Serveurs',
                        value: client.guilds.cache.size.toString(),
                        inline: true,
                    },
                    {
                        name: '👥 Utilisateurs',
                        value: client.users.cache.size.toString(),
                        inline: true,
                    },
                    {
                        name: '🕐 Uptime',
                        value: formatUptime(client.uptime),
                        inline: true,
                    },
                ],
                thumbnail: {
                    url: client.user.displayAvatarURL(),
                },
                footer: {
                    text: 'Discord Bot Hosting Platform',
                },
            };
            message.reply({ embeds: [infoEmbed] });
            break;
            
        case 'salut':
        case 'hello':
        case 'bonjour':
            const greetings = [
                `👋 Salut ${message.author.username}!`,
                `🎉 Hello ${message.author.username}!`,
                `😊 Bonjour ${message.author.username}!`,
                `👋 Coucou ${message.author.username}!`,
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            message.reply(randomGreeting);
            break;
            
        case 'joke':
        case 'blague':
            const jokes = [
                "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon, ils tombent dans le bateau ! 😂",
                "Que dit un escargot quand il croise une limace ? 'Regarde, un nudiste !' 🐌",
                "Pourquoi les poissons n'aiment pas jouer au tennis ? Parce qu'ils ont peur du filet ! 🐟",
                "Qu'est-ce qui est jaune et qui attend ? Jonathan ! 🍌",
                "Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat-mallow ! 🐱",
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            message.reply(randomJoke);
            break;
            
        case 'roll':
        case 'dé':
        case 'dice':
            const maxRoll = args[0] ? parseInt(args[0]) : 6;
            if (isNaN(maxRoll) || maxRoll < 1) {
                message.reply('❌ Veuillez spécifier un nombre valide !');
                return;
            }
            const result = Math.floor(Math.random() * maxRoll) + 1;
            message.reply(`🎲 Vous avez lancé un **${result}** sur ${maxRoll} !`);
            break;
            
        default:
            message.reply(`❌ Commande inconnue. Tapez \`!help\` pour voir les commandes disponibles.`);
    }
});

// Fonction pour formater l'uptime
function formatUptime(uptime) {
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
    
    let uptimeString = '';
    if (days > 0) uptimeString += `${days}j `;
    if (hours > 0) uptimeString += `${hours}h `;
    uptimeString += `${minutes}m`;
    
    return uptimeString;
}

// Gestion des erreurs
client.on(Events.Error, error => {
    console.error('❌ Erreur Discord.js:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Erreur non gérée:', error);
});

// Connexion du bot
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ Token Discord manquant! Ajoutez DISCORD_TOKEN dans vos variables d\'environnement.');
    process.exit(1);
}

client.login(token).catch(error => {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
});

console.log('🚀 Bot en cours de démarrage...');