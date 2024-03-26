const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const dao = require('../db/dataAccessor');

// creates connected stripe account for user upon account registration
const createStripeConnectedAccount = async (user_id, email, fname, lname) => {
    try {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US', // TODO: allow foreign countries
            email: email,
            capabilities: {
                card_payments: {
                    requested: true,
                },
                transfers: {
                    requested: true,
                },
            },
            business_type : 'individual',
            business_profile : {
                product_description : 'PROSCA participation',
                mcc : '7299',
                url : 'https://linkedin.com/in/shangareev',
                support_email : email,
                name : `${fname} ${lname}`,
            },
            tos_acceptance : {
                service_agreement: 'full',
            },
            settings : {
                payouts : {
                    schedule : {
                        interval : 'manual',
                    },
                },
            }
        });
        if (!account.id) {
            throw Error(`Stripe ID is undefined: ${account.id}`)
        }
        return account.id;
    } catch (err) {
        console.log(`error in createStripeConnectedAccount ${err}`)
        throw err;
    }
    
    
}

// authenticates user with stripe
const navigateToStripeAuth = async (stripe_id) => {
    const accountLink = await stripe.accountLinks.create({
        account: stripe_id,
        refresh_url: 'http://localhost:3000/', // TODO: change to link in app where we redirect the person
        return_url: 'https://localhost:3000/', // TODO: change to link in app where we redirect the person
        type: 'account_onboarding',
    });
    return accountLink.url;
}

// charge a pod member - invoked with each cycle
const chargeStripeAccount = async (account_id, amount) => {
    // let customer get into negative and stripe debits their account
    const amountInDollars = amount * 100;

    const transfer = await stripe.transfers.create(
        {
            amount: amountInDollars,
            currency: 'usd',
            destination: process.env.STRIPE_PLATFORM_ID, // platform
        },
        {
            stripeAccount: account_id, // sender
        }
    );

    return transfer;
}

// transfer funds to a stripe connected account
const payStripeAccount = async (account_id, amount) => {
    // in live mode, we automatically payout to the pod member's bank account
    const amountInDollars = amount * 100;

    const transfer = await stripe.transfers.create({
        amount: amountInDollars,
        currency: "usd",
        destination: account_id,
    });

    return transfer;
}

// issue payout to connected account's bank
const payoutToBankAccount = async (account_id, amount) => {
    // in live mode, we automatically payout to the pod member's bank account
    const amountInDollars = amount * 100;

    const payout = await stripe.payouts.create({
        amount: amountInDollars,
        currency: "usd",
    }, {
        stripeAccount: account_id,
    });

    return payout;
}

module.exports = {
    createStripeConnectedAccount,
    navigateToStripeAuth,
    chargeStripeAccount,
    payStripeAccount,
    payoutToBankAccount
}
