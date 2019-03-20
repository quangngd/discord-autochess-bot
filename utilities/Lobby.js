const Room = require("./Room").Room;
const db = require('../utilities/db');
const chess = require('../utilities/chess');
const log = require('../utilities/logger');
const Collection = require("discord.js").Collection;

exports.Lobby = class {
    constructor() {
        this.rooms = new Collection();
        // (K,V) = (room.role.guild.id+'@'+room.id, room)
        // room.id = BigInt(room.role.id).toString(36);
    }

    async addRoom(guild, rank, rankRange, host = null) {
        let room = new Room(guild, rank, rankRange, host);
        await room.init(guild, rank, rankRange);
        log.info(`Add room ${room.id}`);
        this.rooms.set(room.role.guild.id + '@' + BigInt(room.role.id).toString(36), room);
        return room;
    }

    async deleteRoom(room) {
        room.clean();
        this.rooms.delete(room.role.guild.id + '@' + BigInt(room.role.id).toString(36));
    }

    getRoomsFromUser(guildMemberObject) {
        let result = [];
        guildMemberObject.roles.forEach(role => {
            let room = this.rooms.get(guildMemberObject.guild.id + '@' + BigInt(role.id).toString(36));
            if (room) {
                log.info('Found ' + room.name);
                result.push(room);
            }
        });
        return result;
    }

    async getRoomsFromRank(guildMemberObject) {
        let steamId = await db.get(guildMemberObject.id);
        let userRankValue = await chess.getRank(steamId);
        return [...this.rooms.filter(room => {
            return (room.baseRank - room.rankRange) <= userRankValue && userRankValue <= (room.baseRank + room.rankRange);
        }).values()]
    }

    async cleanRooms(guilds) {
        log.info(`Start cleaning abandoned rooms and roles`);
        for (let room of this.rooms) {
            if (room.players.size === 0) {
                room.clean();
            }
        }


        if (guilds) {
            log.info(`Start cleaning untracked rooms and roles`);
            guilds.forEach(guild => {
                log.info(`Clean guild ${guild.name}.`);
                guild.roles.forEach(role => {
                    if (/room-[a-zA-Z1-9]+/.test(role.name)) role.delete();
                });
                guild.channels.forEach(channel => {
                    if (channel.type === 'text' && /room-[a-zA-Z1-9]+/.test(channel.name)) channel.delete();
                });
            });
        }
    }
}


function genId() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    // This should be okay for generating less than 10 thousand unique IDs,
    // (c) git/gordonbrander
    return '_' + Math.random().toString(36).substr(2, 9);
}