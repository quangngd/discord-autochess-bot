const chess = require('../utilities/chess');
const db = require('../utilities/db');
const log = require('../utilities/logger');

exports.run = (client, message, args) => {
    let target = args[0];
    let steamId, userId;
    try {
        if(target) userId = target.match(/<@!?([0-9]+)>/)[1];
        else userId = message.author.id;
    } catch (e) {
        steamId = target;
    }
    finally {
        if(!steamId) db.get(userId)
            .then(data => {
                if(data) rankFromSteam(message, data.steamId);
                else message.reply('no linked Steam found for this account, use "!link [SteamId]" first!');
            })
        else rankFromSteam(message,steamId);
    }

}

function rankFromSteam(message, steamId) {
    chess.fetchUserData(steamId)
        .then(res => res.json())
        .then(userData => {
            if (!userData) message.reply('error retrieving info, recheck your steam id');
            else {
                let rank = chess.parseRank(userData);
                let name = chess.parseName(userData)
                message.reply(`${name} rank: ${rank}`)
            }
        })
        .catch(err => {
            log.error(err);
            message.reply('error retrieving info, recheck your steam id')
        });
}