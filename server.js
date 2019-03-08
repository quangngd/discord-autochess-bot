const Discord = require('discord.js');
const client = new Discord.Client();
const log = require('./utilities/logger');

const prefix = '!';

const token = process.argv[2] || process.env.TOKEN;
log.info(`Use secret: ${token}`);


client.on('message', message => {
    let args = message.content.slice(prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();
    //
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    log.info(`${message.author.username}:${message.content}`)
    //
    try {
        delete require.cache[require.resolve(`./commands/${cmd}.js`)];

        let commandFile = require(`./commands/${cmd}.js`);
        commandFile.run(client, message, args);

    } catch (e) {
        log.error(e.stack);        
        message.reply('unknown cmd!');
    }
});
client.on('ready', () => {
    log.info('Bot start');
});
client.login(token);