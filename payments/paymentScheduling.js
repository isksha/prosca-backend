const schedule = require('node-schedule');

const common = require('../common/commonFunctionalities');
const stripe = require('../payments/stripe');
const dao = require('../db/dataAccessor');

/*
 * Schedule a stripe payout for a user. Invoked for each user in a pod individually via a loop
 *
 * @param {string} recurrenceRate - 'daily', 'weekly', 'biweekly', 'monthly'
 * @param {string} startDate - start date of the lifetime
 * @param {string} orderNum - the period in which the user gets the pod
 */
const scheduleStripePayout = async (userId, depositAmount, startDate, recurrenceRate, orderNum) => {
    const stripeId = 'payout_id' // await dao.getStripeIdFromUserId(userId);
    const payoutDate = common.getDateWithOffset(startDate, recurrenceRate, orderNum); // common.shiftDateByXSeconds(new Date(), 4)

    schedule.scheduleJob(payoutDate, async () => {
        try {
            // console.log("PAYOUT", userId, depositAmount, startDate, recurrenceRate, orderNum)
            await stripe.payStripeAccount(stripeId, depositAmount);
        } catch (err) {
            console.log("Failed to payout to stripe account: " + err.message);
            // TODO: think about failure to get payout flow
        }

        try {
            await dao.addDeposit(userId, depositAmount);
        } catch (e) {
            console.log("Failed to add deposit to internal DB: " + e.message);
        }
    });
}

/*
 * Schedule a series of all stripe charges for a user for an entire lifetime.
 * Invoked for each user in a pod individually via a loop
 *
 * @param {string} recurrenceRate - 'daily', 'weekly', 'biweekly', 'monthly'
 * @param {string} startDate - start date of the lifetime
 * @param {string} orderNum - the period in which the user gets the pod
 */
const scheduleStripeCharges = async (userId, depositAmount, payoutDatesArr) => {
    const stripeId = 'charge_id' // await dao.getStripeIdFromUserId(userId);

    for (let i = 0; i < payoutDatesArr.length; i++) {
        const depositDate =  payoutDatesArr[i];
        console.log(`Deposit date: ${i}`, depositDate)
        schedule.scheduleJob(depositDate, async () => {
            try {
                await stripe.chargeStripeAccount(stripeId, depositAmount);
                // console.log("CHARGE", userId, depositDate, depositAmount)
                // console.log("Charge to stripe account successful");

            } catch (err) {
                console.log("Failed to charge to stripe account: " + err.message);
                // TODO: think about failure to charge flow
            }

            try {
                await dao.addWithdrawal(userId, depositAmount);
            } catch (e) {
                console.log("Failed to add withdrawal to internal DB: " + e.message);
                // TODO: think about failure to charge flow
            }

            // TODO : add to blockchain
        });
    }
}

module.exports = {
    scheduleStripePayout,
    scheduleStripeCharges
}
