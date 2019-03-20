const fetch = require("node-fetch");
const log = require('../utilities/logger');

// API 1
const API_URL_1 = process.env.API_URL_1;
const REFRESH_URL_1 = process.env.REFRESH_URL_1;

fetchUserData1 = async(steamId) => {
    let refreshUrl = REFRESH_URL_1 + steamId;
    let apiUrl = API_URL_1;
    apiUrl += steamId;
    log.info(`Get DAC for ${steamId}`);
    let steamData = null;
    try {
        await (fetch(refreshUrl)); // request to fetch new info
        steamData = await (await fetch(apiUrl)).json();
    } catch (e) {
        log.error(e.stack);
        steamData = null;
    } finally {
        return steamData;
    }
}

getRank1 = async(steamId) => {
    const steamData = await fetchUserData1(steamId);
    if (steamData === null) return null;
    const dacProfile = steamData.dacProfile;
    log.info(`Retrieved steamData for ${steamData.personaName}`);
    log.info(`Retrieved DAC, rank: ${dacProfile.rank}`);
    if (!dacProfile)
        return "unknown";
    var value = dacProfile.rank;
    if (dacProfile.queenRank)
        return "Queen";
    return value;
}

parseRank1 = (value) => {
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
    } else if (value === 46) {
        return "Queen";
    } else return "unlimited"
    if (value % 9 != 0) {
        title += " " + value % 9;
    } else {
        title += " " + 9;
    }

    return title;
}

getName1 = async(steamId) => {
    const steamData = await fetchUserData(steamId);
    if (steamData === null) return null;
    let name = steamData.personaName;
    log.info('Get name returns ' + name);
    return name;
}

// API 2
const API_URL_2 = process.env.API_URL_2;
const STEAM_PROFILE_URL_2 = process.env.STEAM_PROFILE_URL_2

fetchUserData2 = async(steamId) => {
    let apiUrl = API_URL_2;
    apiUrl += '@' + steamId;
    log.info(`Get DAC for ${steamId}`);
    let steamData = null;
    try {
        steamData = await (await fetch(apiUrl)).json();
    } catch (e) {
        log.error(e.stack);
    } finally {
        return steamData;
    }
}

getRank2 = async(steamId) => {
    const steamData = await fetchUserData2(steamId);
    if (steamData === null) return null;
    log.info(`Retrieved steamData for ${steamId}`);
    let value = steamData.user_info[`${steamId}`].mmr_level;
    log.info(`Retrieved DAC, rank: ${value}`);
    return value;
}

function parseRank2(value) {
    // 1-9 = pawn 
    // 10-18 = knight 
    // 19-27 = bishop 
    // 28-36 = rook 
    // 37 = king 
    // 38 = queen 
    var title = ""
    if (value <= 0)
        return "unranked";
    if (value / 9 <= 1) {
        title += "Pawn";
    } else if (value / 9 <= 2) {
        title += "Knight";
    } else if (value / 9 <= 3) {
        title += "Bishop";
    } else if (value / 9 <= 4) {
        title += "Rook";
    } else if (value === 37) {
        title += "King";
    } else if (value === 38) {
        return "Queen";
    } else return "unlimited";

    if (value % 9 != 0) {
        title += " " + value % 9;
    } else {
        title += " " + 9;
    }

    return title;
}

async function getName2(steamId) {
    const steamData = await (await fetch(STEAM_PROFILE_URL_2 + steamId + '/?xml=1')).text();
    if (steamData === null) return null;
    const name = /<steamID><!\[CDATA\[(.+)\]\]><\/steamID>/.exec(steamData)[1];
    log.info('Get name returns ' + name);
    return name;
}

if (process.env.API_USED == 1) {
    module.exports.getName = getName1;
    module.exports.getRank = getRank1;
    module.exports.parseRank = parseRank1;
} else if (process.env.API_USED == 2) {
    module.exports.getName = getName2;
    module.exports.getRank = getRank2;
    module.exports.parseRank = parseRank2;
}