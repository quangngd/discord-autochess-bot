const chess = require('../utilities/chess');
const db = require('../utilities/db');
const log = require('../utilities/logger');

const linkURL = process.env.LINK_URL;

exports.run = async (client, message, args) => {
    let userId = message.author.id;
    let embed = {
        "color": 12729122,
        "description": "Unknow command."
    }

    if (args.length == 0) {
        // !link: check if author has linked

        let steamId = await db.get(userId);

        if (!steamId) embed = {
            "color": 12729122,
            "description": `No linked account found. Please use this [link](${linkURL}) to connect discord to your steam.`
        };
        else {
            let steamName = await chess.getName(steamId);
            embed = {
                "color": 2278027,
                "description": `You have been linked with **${steamName}**! You can do "!link relink" if you wish to update you info.`
            };
        }
    } else if (args.length == 1 && /<@!?([0-9]+)>/.test(args[0])) {
        // !link @user: check if @user has linked

        let userId = /<@!?([0-9]+)>/.exec(args[0])[1];
        let steamId = await db.get(userId);

        if (!steamId) embed = {
            "color": 12729122,
            "description": `No linked account found for <@${userId}>!`
        };
        else {
            let steamName = await chess.getName(steamId);
            embed = {
                "color": 2278027,
                "description": `<@${userId}> has been linked with **${steamName}**!`
            };
        }
    } else if (args.length == 1 && args[0] === 'relink')
        // !link relink: send link again
        embed = {

            "color": 2278027,
            "description": `Use this [link](${linkURL}) to update your info.`
        };


    message.channel.send({
        embed
    })
}