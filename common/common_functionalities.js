const {v4: uuidv4} = require("uuid");

const DEFAULT_USER_SCORE = 350
const DEFAULT_WALLET_AMOUNT = 0

function generateUniqueId() {
    return uuidv4()
}

function getDate() {
    return new Date()
}

module.exports = {
    DEFAULT_USER_SCORE,
    DEFAULT_WALLET_AMOUNT,
    generateUniqueId,
    getDate
}