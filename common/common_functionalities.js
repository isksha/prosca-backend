const {v4: uuidv4} = require("uuid");
const CryptoJS = require('crypto-js');

const DEFAULT_USER_SCORE = 350
const DEFAULT_WALLET_AMOUNT = 0

const PRIVATE_VISIBILITY_STRING = 'private'

function generateUniqueId() {
    return uuidv4()
}

function getDate() {
    return new Date()
}

function generateSHA256Hash(valueToHash) {
    return CryptoJS.SHA256(valueToHash).toString(CryptoJS.enc.Hex);
}

module.exports = {
    DEFAULT_USER_SCORE,
    DEFAULT_WALLET_AMOUNT,
    PRIVATE_VISIBILITY_STRING,
    generateUniqueId,
    getDate,
    generateSHA256Hash
}