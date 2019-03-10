const fetch = require('node-fetch');
const dbGetURL = process.env.DB_GET_URL;
const log = require('./logger');


module.exports.get = async (userId) => {
    let res = await fetch(dbGetURL + `?userId=${userId}`);
    let steamId = (await res.json()).steamid;
    log.info(`Get steamid for ${userId}: ${steamId}`)
    return steamId;
}
