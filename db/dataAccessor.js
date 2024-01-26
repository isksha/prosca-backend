const podLifetimesDb = require('./podLifetimesDb')
const podsDb = require('./podsDb')
const transactionsDb = require('./transactionsDb')
const userPodsDb = require('./userPodsDb')
const usersDb = require('./usersDb')
const usersStripeDb = require('./usersStripeDb')
const userFriendshipsDb = require('./userFriendshipsDb')
const userPayoutDatesDb = require('./userPayoutDatesDb')

module.exports = {
    ...podLifetimesDb,
    ...podsDb,
    ...transactionsDb,
    ...userPodsDb,
    ...usersStripeDb,
    ...usersDb,
    ...userPayoutDatesDb,
    ...userFriendshipsDb,
}