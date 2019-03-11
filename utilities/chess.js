const fetch = require("node-fetch");
const log = require('../utilities/logger');
const DAC_API = process.env.DAC_API;
const REFRESH_URL = process.env.REFRESH_URL;
fetchUserData = async (steamId) => {
    let refreshUrl = REFRESH_URL + steamId;
    let apiUrl = DAC_API;
    apiUrl += steamId;
    log.info(`Get DAC for ${steamId}`);
    let steamData = null;
    try {
        await(fetch(refreshUrl)); // request to fetch new info
        steamData = await (await fetch(apiUrl)).json();
    } catch (e) {
        log.error(e.stack);
        steamData = null;
    } finally{
        return steamData;
    }
}

module.exports.getRank = async (steamId) => {
    const steamData = await fetchUserData(steamId);
    if(steamData === null) return null;
    const dacProfile = steamData.dacProfile;
    log.info(`Retrieved steamData for ${steamData.personaName}`);
    log.info(`Retrieved DAC, rank: ${dacProfile.rank}`);
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

module.exports.getName = async (steamId) => {
    const steamData = await fetchUserData(steamId);
    if(steamData === null) return null;
    let name = steamData.personaName;
    log.info('Get name returns ' + name);
    return name;
}