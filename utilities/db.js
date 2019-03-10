const fetch = require('node-fetch');
const DB_GET_URL = process.env.DB_GET_URL;
const log = require('./logger');


module.exports.get = async (userId) => {
    let res = await fetch(DB_GET_URL + `?userId=${userId}`);
    let steamId = (await res.json()).steamid;
    steamId = fixSteamId(steamId);
    log.info(`Get steamid for ${userId}: ${steamId}`)
    return steamId;
}

function fixSteamId(steamId) {
    if(steamId === null) return null;
    let id = BigInt(steamId);
    if(!Boolean(((id - (id%4294967296n))/4294967296n)%2n)) //magic line
      id = id + 4294967296n;
    return id.toString();
  }
