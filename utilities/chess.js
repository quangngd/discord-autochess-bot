const fetch = require("node-fetch");
const log = require('../utilities/logger');
const DAC_API = process.env.DAC_API;

fetchUserData = async (steamId) => {
    url = DAC_API;
    url += steamId;
    log.info(`Log from ${url}`);
    let steamData = await (await fetch(url)).json();
    return steamData;
}

module.exports.getRank = async (steamId) => {
    const steamData = await fetchUserData(steamId);
    const dacProfile = steamData.dacProfile;
    log.info(JSON.stringify(steamData));
    log.info(JSON.stringify(dacProfile));
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
    let name = (await fetchUserData(steamId)).personaName;
    log.info(name);
    return name;
}