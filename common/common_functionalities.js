const {v4: uuidv4} = require("uuid");
const CryptoJS = require('crypto-js');

const DEFAULT_USER_SCORE = 350
const DEFAULT_WALLET_AMOUNT = 0

const PRIVATE_VISIBILITY_STRING = 'private'
const PUBLIC_VISIBILITY_STRING = 'public'

const DEPOSIT_TYPE_STRING = 'deposit'
const WITHDRAWAL_TYPE_STRING = 'withdrawal'

let RECURRENCE_STRING_TO_DIGIT_MAP = new Map([
    ['weekly', 7],
    ['biweekly', 14],
    // todo : add monthly
]);

function generateUniqueId() {
    return uuidv4()
}

function getDate() {
    return new Date()
}

function generateSHA256Hash(valueToHash) {
    return CryptoJS.SHA256(valueToHash).toString(CryptoJS.enc.Hex);
}

function getDateWithOffset(last_start, recurrenceRate) {
    let currentDate = new Date(last_start);

    // Add x days to the current date
    currentDate.setDate(currentDate.getDate() + RECURRENCE_STRING_TO_DIGIT_MAP.get(recurrenceRate));
    return currentDate;
}

function getCurrCycle(last_start, recurrenceRate) {
    let currentDate = getDate();
    let diffInTime = currentDate.getTime() - last_start.getTime();
    let diffInDays = diffInTime / (1000 * 3600 * 24);
    return Math.floor(diffInDays / RECURRENCE_STRING_TO_DIGIT_MAP.get(recurrenceRate)) + 1;
}

module.exports = {
    DEFAULT_USER_SCORE,
    DEFAULT_WALLET_AMOUNT,
    PRIVATE_VISIBILITY_STRING,
    PUBLIC_VISIBILITY_STRING,
    DEPOSIT_TYPE_STRING,
    WITHDRAWAL_TYPE_STRING,
    generateUniqueId,
    getDate,
    generateSHA256Hash,
    getDateWithOffset,
    getCurrCycle
}