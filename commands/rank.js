const chess = require('../utilities/chess');
const db = require('../utilities/db');
const log = require('../utilities/logger');

exports.run = (client, message, args) => {
    let steamId = args[0];
    if (steamId)
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
    else {
        db.get(message.author.id).then(old => {
            if (old) {
                let { userId, steamId } = old;
                chess.fetchUserData(steamId)
                    .then(res => res.json())
                    .then(json => {
                        if (!json) {
                            message.reply('error retrieving info, consider relinking your steamid');
                        }
                        return json;
                    })
                    .then(userData => ({
                        rank: chess.parseRank(userData),
                        name: chess.parseName(userData)
                    }))
                    .then(({
                        rank,
                        name
                    }) => message.reply(`${name} rank: ${rank}`))
                    .catch(err => log.error(err.stack));
            } else message.reply('no linked Steam id found. Use "!link [steamid]" to link first.');
        })
    }
}