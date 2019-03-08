const Discord = require('discord.js');
const Message = Discord.Message;
const { Client } = require('pg');

var client = null;

async function getDbClient() {
    if (client)
        return client;

    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });
    await client.connect();
    return client;
}

/**
 * 
 * @param {Message} message 
 * @param {String} args 
 */
async function linkAccount(message, args) {
    try {
        var user = message.author;
        var userId = user.id;
        var dbClient = await getDbClient();
        var res = await client.query("Select * from steamlink where steamid = $1", [args[0]]);
        if (res.rows.length) {
            var linkedUser = message.client.users.get(res.rows[0].userId);
            if (!linkedUser) {
                message.channel.send("Steam id **" + args[0] + "** is already linked.");
                return;
            } else {
                message.channel.send("Steam id **" + args[0] + "** is already linked to <@!" + linkedUser.id + ">");
                return;
            }
        }

        checkSteamId(args[0],function(valid){
            if (valid){
                // insert to database
                res = await client.query("Insert into steamlink(steamid,userid) values($1,$2)", [args[0], userId]);
                message.channel.send("Linked steam id **" + args[0] + "** to user <@!" + userId + "> successfully.");
            }
        });
        
    } catch (ex) {
        console.log(ex);
    }
}

function checkSteamId(steamId,cb){
    if (steamId.length < 10){
        cb(false);
        return;
    }
    http.get('http://www.autochess-stats.com/backend/api/dacprofiles/' + steamId, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            cb(resp.statusCode == 200);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

/**
 * 
 * @param {Message} message 
 * @param {String} args 
 */
async function checkRank(message, args) {
    try {
        var user = message.author;
        if (args.length > 0) {
            var checkarg = args[0];
            if (checkarg.startsWith("<@") && checkarg.endsWith(">")){
                var startIndex = checkarg.search(/[0-9]/g);
                var endIndex = checkarg.indexOf(">");
                user = message.client.users.get(checkarg.substr(startIndex,endIndex - startIndex));
            }else{
            fetchRank(args[0],message);
            return;
            }
        }
        var userId = user.id;
        var dbClient = await getDbClient();
        var res = await client.query("Select * from steamlink where userid = $1", [userId]);
        if (!res.rows.length) {
            message.channel.send("User <@!" + userId + "> haven't linked to any steam.");
            return;
        }

        res.rows.forEach(row => {
            fetchRank(row.steamid, message);
        });
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * 
 * @param {String} steamid 
 * @param {Message} message 
 */
async function fetchRank(steamid, message) {
    const http = require('http');
    http.get('http://www.autochess-stats.com/backend/api/dacprofiles/' + steamid, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            if (resp.statusCode != 200) {
                message.channel.send("Steam id **" + steamid + "** is invalid.");
                return;
            }

            // check last fetch
            try {
                var json = JSON.parse(data);
                var lastFetched = json.lastFetched;

                // refresh each hours 
                if (Date.now() - Date.parse(lastFetched) > 3600000) {
                    const req = http.request({
                        host: 'www.autochess-stats.com',
                        port: 80,
                        method: 'POST',
                        path: '/backend/api/dacprofiles/' + steamid + '/requestfetch/'
                    }, (res) => {
                        res.resume();
                        res.on('end', () => {
                            fetchRank(steamid, message);
                        });
                    });
                    req.write('');
                    req.end();
                    return;
                }

                var steamName = json.personaName;
                var rank = parseRank(json);
                message.channel.send("Steam user **" + steamName + "** : rank **" + rank + "**.");
            } catch (ex) {
                console.log(ex);
            };
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function parseRank(json) {
    var dacProfile = json.dacProfile;
    if (!dacProfile)
        return "unknown";
    if (dacProfile.queenRank)
        return "Queen";
    var value = dacProfile.rank;
    var title = ""
    if (value < 0)
        return "unranked";
    if (value / 9 <= 1) {
        title += "Pawn";
    } else if (value / 9 <= 2) {
        title += "Knight";
    } else if (value / 9 <= 3) {
        title += "Bishop";
    } else if (value / 9 <= 4) {
        title += "Rook";
    } else if (value / 9 <= 5) {
        title += "King";
    }
    if (value % 9 != 0) {
        title += " " + value % 9;
    } else {
        title += " " + 9;
    }

    return title;
}

module.exports = {
    linkAccount,
    checkRank
};