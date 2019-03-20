// Load env variables
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const log = require('./utilities/logger');
const Lobby = require('./utilities/Lobby').Lobby;

const prefix = '!';

const token = process.env.TOKEN;
log.info(`Use secret: ${token}`);

let lobby = new Lobby();

client.on('message', message => {
    let args = message.content.slice(prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    log.info(`${message.author.username}:${message.content}`)

    try {
        // special case for !lobby and !room
        if (cmd === 'lobby' || cmd === 'room') {
            delete require.cache[require.resolve(`./commands/${cmd}.js`)];
            let commandFile = require(`./commands/${cmd}.js`);
            commandFile.run(client, message, args, lobby);
        } else {
            delete require.cache[require.resolve(`./commands/${cmd}.js`)];
            let commandFile = require(`./commands/${cmd}.js`);
            commandFile.run(client, message, args);
        }
    } catch (e) {
        log.error(e.stack);
        //message.reply('unknown cmd! Use !help');
    }
});
client.on('ready', () => {
    log.info('Bot start');
    lobby.cleanRooms(client.guilds);

});



client.login(token);