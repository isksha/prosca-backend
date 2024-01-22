const podLifetimesDb = require('./podLifetimesDb')
const podsDb = require('./podsDb')
const transactionsDb = require('./transactionsDb')
const userPodsDb = require('./userPodsDb')
const usersDb = require('./usersDb')
const usersStripeDb = require('./usersStripeDb')
const votesDb = require('./votesDb')
const walletsDb = require('./walletsDb')

module.exports = {
    ...podLifetimesDb,
    ...podsDb,
    ...transactionsDb,
    ...userPodsDb,
    ...usersStripeDb,
    ...usersDb,
    ...votesDb,
    ...walletsDb,
    ...userPodsDbFriendshipsDb,
}