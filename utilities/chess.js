const fetch = require("node-fetch");

module.exports.fetchUserData = (steamId) => {
    url = 'http://www.autochess-stats.com/backend/api/dacprofiles/';
    url += steamId;
    return fetch(url);
}

module.exports.parseRank = (data) => {
    var dacProfile = data.dacProfile;
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

module.exports.parseName = (data) => {    
    return (data.personaName)? data.personaName : 'Unknown';
}