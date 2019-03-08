module.exports.tag = (userId) => {
    return `<@${userId}>`
}

module.exports.tagNickname = (userId) => {
    return `<@!${userId}>`
}
