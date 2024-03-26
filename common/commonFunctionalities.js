const {v4: uuidv4} = require("uuid");
const CryptoJS = require('crypto-js');

const DEFAULT_USER_SCORE = 1
const DEFAULT_WALLET_AMOUNT = 0

const PRIVATE_VISIBILITY_STRING = 'private'
const PUBLIC_VISIBILITY_STRING = 'public'

const DEPOSIT_TYPE_STRING = 'deposit'
const WITHDRAWAL_TYPE_STRING = 'withdrawal'

const S3_BUCKET_NAME = 'prosca-profile-pics'
const AWS_REGION = 'us-east-1'

// sign up restrictions
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_NUMBER_REGEX = /^\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}$/

// ------------------------------------ CODE GENERATION ------------------------------------ //

function generateUniqueId() {
    return uuidv4()
}

function generateSHA256Hash(valueToHash) {
    return CryptoJS.SHA256(valueToHash).toString(CryptoJS.enc.Hex);
}

// ------------------------------------ TIME-BASED ------------------------------------ //

let RECURRENCE_STRING_TO_DIGIT_MAP = new Map([
    ['weekly', 7],
    ['biweekly', 14],
]);

function getDate() {
    return new Date()
}

function getDateWithOffset(last_start, recurrenceRate, numPeriods) {
    let currentDate = new Date(last_start);

    if (recurrenceRate === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + numPeriods);
    } else {
        currentDate.setDate(currentDate.getDate() + numPeriods * RECURRENCE_STRING_TO_DIGIT_MAP.get(recurrenceRate));
    }

    return currentDate;
}

function getCurrCycle(last_start, recurrenceRate) {
    let currentDate = getDate();
    let diffInTime = currentDate.getTime() - last_start.getTime();
    let diffInDays = diffInTime / (1000 * 3600 * 24);
    return Math.floor(diffInDays / RECURRENCE_STRING_TO_DIGIT_MAP.get(recurrenceRate)) + 1;
}

// generate deposit dates for all cycles in the lifetime of the pod
function getDepositDates(last_start, recurrenceRate, orderArray) {
    let currentDate = new Date(last_start);
    let numMembers = orderArray.length;

    // create global array of deposit dates
    let depositDatesGlobal = Array();
    for (let i = 0; i < numMembers; i++) {
        depositDatesGlobal.push(getDateWithOffset(currentDate, recurrenceRate, i))
    }

    // create 2D array of deposit dates for each member
    let depositDates = Array(numMembers);
    for (let i = 0; i < numMembers; i++) {
        depositDates[i] = depositDatesGlobal.slice();
    }

    // remove the date in which the member is supposed to get the pot for each user
    for (let i = 0; i < numMembers; i++) {
        depositDates[i].splice(orderArray[i] - 1, 1);
    }

    return depositDates;
}

// for testing scheduling
function shiftDateByXSeconds(date, seconds) {
    let newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
}

// ------------------------------------ MATH ------------------------------------ //

// determine the order in which the users will get the pot - randomized
function generateRandomOrderArray(n) {
    // initialize arr with ints between 1 and n
    const arr = Array.from({ length: n }, (_, index) => index + 1);

    // perform Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

module.exports = {
    DEFAULT_USER_SCORE,
    DEFAULT_WALLET_AMOUNT,
    PRIVATE_VISIBILITY_STRING,
    PUBLIC_VISIBILITY_STRING,
    DEPOSIT_TYPE_STRING,
    WITHDRAWAL_TYPE_STRING,
    S3_BUCKET_NAME,
    AWS_REGION,
    PASSWORD_REGEX,
    EMAIL_REGEX,
    PHONE_NUMBER_REGEX,
    generateUniqueId,
    getDate,
    generateSHA256Hash,
    getDateWithOffset,
    getCurrCycle,
    getDepositDates,
    generateRandomOrderArray,
    shiftDateByXSeconds
}