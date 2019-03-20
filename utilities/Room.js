const crypto = require("crypto");
const chess = require('../utilities/chess');
const db = require('../utilities/db');
const {
    RichEmbed
} = require('discord.js');
const log = require('../utilities/logger');

const MAX_PLAYER = process.env.MAX_PLAYER;

exports.Room = class {
    constructor(guild, baseRank, rankRange, host = null) {
        this.password = genPass();
        this.baseRank = baseRank;
        this.rankRange = rankRange;
        this.players = [];
        this.host = host;
        log.info(`Create a room.`)
    }

    async init(guild, baseRank, rankRange) {
        // Set up corresponding role
        this.role = await guild.createRole();

        // Room ID is converted from role id for short
        this.id = BigInt(this.role.id).toString(36);
        this.role.setName("room-" + this.id);

        // Set up text channel
        this.channel = await guild.createChannel('room-' + this.id, 'text');
        await this.channel.edit({
            userLimit: MAX_PLAYER
        });
        await this.channel.overwritePermissions(guild.roles.find('name', '@everyone'), {
            'VIEW_CHANNEL': false,
            'SEND_MESSAGES': false,
            'CREATE_INSTANT_INVITE': false,
        });
        await this.channel.overwritePermissions(this.role, {
            'VIEW_CHANNEL': true,
            'SEND_MESSAGES': true,
        });
        log.info(`Init a room to id ${this.id}`)
        return this;
    }

    async addPlayer(memberObject) {
        if (this.players.length >= MAX_PLAYER) return false;
        this.players.push(memberObject);
        await memberObject.addRole(this.role);
        let embed = new RichEmbed()
            .setColor(2278027)
            .setDescription(`${memberObject} has joined.`);
        await this.channel.send(embed);
        log.info(`Added ${memberObject.nickname} to ${this.id}`);
        return true;
    }

    async removePlayer(memberObject) {
        this.players = this.players.filter(player => !player.user.equals(memberObject.user));
        await memberObject.removeRole(this.role);
        let embed = new RichEmbed()
            .setColor(12729122)
            .setDescription(`${memberObject} has left.`);
        await this.channel.send(embed);
        log.info(`Remove ${memberObject.name} from ${this.id}`);
    }

    async sendPlayers() {
        let embed = new RichEmbed()
            .setColor(12615680)
            .addField('Players List', `${this.players.length}/${MAX_PLAYER}`);

        for (const player of this.players) {
            let steamId = await db.get(player.id);
            let steamName = await chess.getName(steamId);
            let rank = chess.parseRank(await chess.getRank(steamId));
            embed.addField(`${player.displayName}`, `as ${steamName} - ${rank}`);
        }
        this.channel.send(embed);
    }

    sendPassword() {
        let embed = new RichEmbed()
            .setColor(12615680)
            .addField('Password:', `${this.password}`);
        this.channel.send(embed);
    }

    delay(t, v) {
        return new Promise(function(resolve) {
            setTimeout(resolve.bind(null, v), t)
        });
    }

    async clean() {
        let embed = new RichEmbed()
            .setColor(12729122)
            .setDescription(`Room will be deleted after 10s`);
        log.info(`Counting down for cleaning room ${this.id}`)
        await this.channel.send(embed).then(async() => {
            return this.delay(10000).then(() => {
                this.role.delete().then(() => {
                    log.info('Role deleted');
                })
                this.channel.delete().then(() => {
                    log.info('Channel deleted');
                })
            })
        })
    }
}

function genPass() {
    const id = crypto.randomBytes(10).toString('hex');
    return id;
}