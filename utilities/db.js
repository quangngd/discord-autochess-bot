const {Store} = require("fs-json-store");
const repo = './data/';


module.exports.post = async (userId, steamId) => {
    let data = {
        id: userId,
        steamId: steamId
    }
    return new Store({file: repo+userId}).write(data);
}

module.exports.get = async (userId) => {
    return new Store({file: repo+userId}).read();
}
