const Discord = require('discord.js');
const client = new Discord.Client();
const log = require('./utilities/logger');

const prefix = '!';
const ownerID = ('548313501651959823');



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
    console.log('Bot start.')
});
client.login('NTQ4MzEzNTAxNjUxOTU5ODIz.D1-KBw.pcL0ldq_9N06ijr4N7sMj_jL-Ig');