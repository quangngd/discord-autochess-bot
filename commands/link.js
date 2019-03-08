const chess = require('../utilities/chess');
const db = require('../utilities/db');
const log = require('../utilities/logger');

exports.run = (client, message, args) => {
    let userId = message.author.id;
    let steamId = args[0];
    let force = args[1];

    old = db.get(userId).then(old =>{        
        if(!old || force === 'force') {
            if (db.post(userId, steamId)) message.reply('successfully linked!')
            else message.reply('linking fails, please try again?');
        }
        else message.reply('you has already linked, use "!link [steamId] force" to confirm overwriting!');
    })
    
}