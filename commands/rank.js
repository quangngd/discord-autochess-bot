const chess = require('../utilities/chess');
const db = require('../utilities/db');
const log = require('../utilities/logger');

const LINK_URL = process.env.LINK_URL;

exports.run = async (client, message, args) => {
    let user = message.author;
    let userId = user.id;
    let embed = {
        "color": 12729122,
        "description": `${user}. Unknow command.`
    }

    if (args.length == 0) {
        // !rank: check self's rank

        let steamId = await db.get(userId);

        if (!steamId) embed = {
            "color": 12729122,
            "description": `${user}. No linked account found. Please use this [link](${LINK_URL}) to connect discord to your steam.`
        };
        else {
            let steamName = await chess.getName(steamId);
            let rank = chess.parseRank(await chess.getRank(steamId));
            embed = {
                "color": 2278027,
                "description": `${user}, **${steamName}**, your rank is **${rank}**`
            };
        }
    } else if (args.length == 1 && /<@!?([0-9]+)>/.test(args[0])) {
        // !rank @user: check @user's rank

        let userId = /<@!?([0-9]+)>/.exec(args[0])[1];
        let steamId = await db.get(userId);

        if (!steamId) embed = {
            "color": 12729122,
            "description": `${user}. No linked account found for <@${userId}>!`
        };
        else {
            let steamName = await chess.getName(steamId);
            let rank = chess.parseRank(await chess.getRank(steamId));
            embed = {
                "color": 2278027,
                "description": `${user}. **${steamName}**'s rank is **${rank}**.`
            };
        }
    } else if (args.length == 1 && /[0-9]+/.test(args[0])) {
        // !rank steamId:
        let steamId = args[0];
        let steamName = await chess.getName(steamId);
        let rank = chess.parseRank(await chess.getRank(steamId));
        if(!rank || !steamName) embed = {
            "color": 12729122,
            "description": `${user}. Maybe you should recheck the Steam ID`
        }; else {
            embed = {
                "color": 2278027,
                "description": `${user}. **${steamName}**'s rank is **${rank}**.`
            };
        }
    }

    message.channel.send({
        embed
    });
}