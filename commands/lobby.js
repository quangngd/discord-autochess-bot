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

    if (!steamId) embed = {
        "color": 12729122,
        "description": `${user}. No linked account found. Please use this [link](${LINK_URL}) to connect discord to your steam.`
    };
    else {
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
        } else if (userCurrentRooms.length === 1) {
            // All of !lobby cmd can only be used when user is not in any room
            embed = {
                "color": 12729122,
                "description": `${user}. Cannot use !lobby commands when you are still in a room. Use "!room leave" in your room channel.`
            };
        } else if ((args.length === 0) || (args.length === 1 && args[0] === 'list')) {
            // !lobby: return all suitable rooms in source guild for author
            // !lobby list: return all suitable rooms in source guild for author
            let rooms = await lobby.getRoomsFromRank(member);
            log.info(`Return: ${rooms.length} rooms`);
            if (rooms.length === 0) {
                embed = {
                    "color": 12729122,
                    "description": `${user}. Oops! No room found for you! Create your own with "!lobby create" or "!lobby create [rankRange].`
                }
            } else {
                embed = new RichEmbed()
                    .setColor(12615680)
                    .addField(`Room list `, `for ${user}`);
                rooms.forEach(async room => {
                    embed.addField(`Room ${room.id}:`, `${chess.parseRank(room.baseRank-room.rankRange)} to ${chess.parseRank(room.baseRank+room.rankRange)}`)
                });
            }
        } else if (args.length === 2 && args[0] === 'list' && args[1] === 'all') {
            // !lobby list all: room in given guild
            let rooms = lobby.rooms;
            if (rooms.length === 0) {
                embed = {
                    "color": 12729122,
                    "description": `${user}. Oops! No room found for you! Create your own with "!lobby create" or "!lobby create [rankRange].`
                }
            } else {
                embed = new RichEmbed()
                    .setColor(12615680)
                    .addField(`Full room list`, `for ${user}`);
                rooms.forEach(async room => {
                    embed.addField(`Room ${room.id}`, `${chess.parseRank(room.baseRank-room.rankRange)} to ${chess.parseRank(room.baseRank+room.rankRange)}`)
                });
            }
        } else if ((args[0] === 'create' || args[0] === 'new') && args.length <= 2) {
            // !lobby create: create room with default value (user's rank, 100)
            // !lobby create rank_range: create room with given value (user's rank, rank_range)
            // !lobby new:
            // !lobby new rank_range:
            let rankRange = 4;
            if (args.length === 2) {
                rankRange = args[1];
            }
            let room = await lobby.addRoom(guild, rankValue, rankRange, user);
            await room.addPlayer(member);
            await room.sendPassword();
            await room.sendPlayers();
            embed = {
                "color": 2278027,
                "description": `${user}, room created as with id ${room.id} for ${chess.parseRank(room.baseRank-room.rankRange)} to ${chess.parseRank(room.baseRank+room.rankRange)}`
            };

        } else if (args.length === 2 && args[0] === 'join' && !/<@!?([0-9]+)>/.test(args[1])) {
            // !lobby join [roomId]
            let roomId = args[1];
            let room = lobby.rooms.get(guild.id + '@' + roomId);
            if (room === undefined) {
                embed = {
                    "color": 12729122,
                    "description": `${user}. Oops! No room with such Id found.`
                }
            } else {
                if ((room.baseRank - room.rankRange) <= rankValue && rankValue <= (room.baseRank + room.rankRange)) {
                    if (room.addPlayer(member)) {
                        embed = {
                            "color": 2278027,
                            "description": `${user} has joined ${room.id}`
                        };
                    } else {
                        embed = {
                            "color": 12729122,
                            "description": `${user}. Oops! The room is full.`
                        }
                    }
                } else {
                    embed = {
                        "color": 12729122,
                        "description": `${user}, the room is for ${chess.parseRank(room.baseRank-room.rankRange)} to ${chess.parseRank(room.baseRank+room.rankRange)} while you are ${chess.parseRank(rankValue)}.`
                    }
                }
            }
        } else if (args.length === 2 && args[0] === 'join' && /<@!?([0-9]+)>/.test(args[1])) {
            // !lobby join @user
            let userId = /<@!?([0-9]+)>/.exec(args[1])[1];
            let rooms = lobby.getRoomsFromUser(guild.members.get(userId));
            if (rooms) {
                if (rooms.length != 1) {
                    embed = {
                        "color": 12729122,
                        "description": `${user}. Oops! Something wrong happens, the user is in none or more than 1 room.`
                    }
                } else {
                    let room = room[0];
                    if ((room.baseRank - room.rankRange) <= rankValue && rankValue <= (room.baseRank + room.rankRange)) {
                        if (room.addPlayer(member)) {
                            embed = {
                                "color": 2278027,
                                "description": `${user} has joined ${room.id}`
                            };
                        } else {
                            embed = {
                                "color": 12729122,
                                "description": `${user}. Oops! The room is full.`
                            }
                        }
                    } else {
                        embed = {
                            "color": 12729122,
                            "description": `${user}, the room is for ${chess.parseRank(room.baseRank-room.rankRange)} to ${chess.parseRank(room.baseRank+room.rankRange)} while you are ${chess.parseRank(rankValue)}.`
                        }
                    }
                }

            } else {
                embed = {
                    "color": 12729122,
                    "description": `${user}. Oops! No user with such Id found in the guild.`
                }
            }

        } else if (args.length === 1 && args[0] === 'clean') {
            // !lobby clean: check for user's admin perm then perform cleaning
            ///WIP
        }
    }

    message.channel.send({
        embed
    });
}