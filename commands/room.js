const chess = require('../utilities/chess');
const db = require('../utilities/db');
const log = require('../utilities/logger');
const {
    RichEmbed
} = require('discord.js');

const LINK_URL = process.env.LINK_URL;

exports.run = async(client, message, args, lobby) => {
    let user = message.author;
    let member = message.member;
    let userId = user.id;
    let steamId = await db.get(userId);
    let guild = message.guild;
    let embed = {
        "color": 12729122,
        "description": `${user}. Unknown command.`
    }

    if (!steamId) {
        embed = {
            "color": 12729122,
            "description": `${user}. No linked account found. Please use this [link](${LINK_URL}) to connect discord to your steam.`
        };
    } else {
        let rankValue = await chess.getRank(steamId);
        let rank = chess.parseRank(rankValue);

        let userCurrentRooms = lobby.getRoomsFromUser(member);
        if (userCurrentRooms.length > 1) {
            // Error detected!
            // User can only be in one room at a time.
            // Prune all room role.
            embed = {
                "color": 12729122,
                "description": `${user}. Error! User can only be in one room at a time. Pruning all room roles!`
            };
            await member.removeRoles(lobby.getRoomsFromUser(member));
        } else if (userCurrentRooms.length === 0) {
            embed = {
                "color": 12729122,
                "description": `${user}. Join a room first. Do "!lobby" to find room.`
            };
        } else {
            if (!message.channel.equals(userCurrentRooms[0].channel)) {
                embed = {
                    "color": 12729122,
                    "description": `${user}. You can only use "!room" commands in your room's text channel.`
                };
            } else {
                let room = userCurrentRooms[0];
                if ((args.length === 0) || (args.length === 1 && args[0] === 'info')) {
                    // !room: display current room's info
                    // !room info:
                    room.sendPlayers();
                    room.sendPassword();
                    embed = null;

                } else if (args.length === 1 && args[0] === 'leave') {
                    // !room leave: leave current room
                    room.removePlayer(member);
                    embed = null;
                } else if ((args.length === 1 && args[0] === 'pass') ||
                    (args.length === 1 && args[0] === 'password')) {
                    // !room password: send password to room's channel
                    // !room pass:
                    room.sendPassword();
                    embed = null;
                } else if ((args.length === 1 && args[0] === 'list') ||
                    (args.length === 1 && args[0] === 'player') ||
                    (args.length === 1 && args[0] === 'players')) {
                    // !room list: list of users in room to room's channel
                    // !room player
                    // !room players

                    room.sendPlayers();
                    embed = null;

                    room.sendPlayers();
                } else if ((args.length === 1 && args[0] === 'done')) {
                    // !room done: check for room owner permission and delete room
                    if (user.equals(room.host)) {
                        lobby.deleteRoom(room);
                        embed = null;
                    } else {
                        embed = {
                            "color": 12729122,
                            "description": `${user}. You are not the host.`
                        };
                    }
                }
            }
        }
    }

    if (embed) message.channel.send({
        embed
    });
}