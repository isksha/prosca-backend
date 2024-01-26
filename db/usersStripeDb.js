const {dbConnection} = require("./dbConnection");

/*
    parameters: user_id, pod_id, date_joined
    returns: 1 on success, error message on error
*/
const addUserStripeConnectedAccount = async(user_id, stripe_id) => {
    return new Promise((resolve, reject) => {
        // User_Stripe(user_id, stripe_id)
        // Users with a stripe_id are not re-added
        const query = `
        INSERT INTO User_Stripe (user_id, stripe_id) VALUES (?, ?)
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id, stripe_id], (err, result) => {
                if (err) {
                    reject(`Error in addUserStripeConnectedAccount: cannot associate user with connected account. ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in addUserStripeConnectedAccount: no rows were modified when adding user to User_Stripe table. User already in DB`);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            });
        });
    });
}

const getStripeIdFromUserId = async (user_id) => {
    return new Promise((resolve, reject) => {
        // User_Stripe(user_id, stripe_id)
        const query = `
        SELECT stripe_id
        FROM User_Stripe
        WHERE user_id = ?
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id], (err, result) => {
                if (err) {
                    reject(`Error in getStripeIdFromUserId: cannot get stripe_id from User_Stripe table. ${err.message}`);
                } else if (result.length === 0) {
                    reject(`Error in getStripeIdFromUserId: no rows were modified when getting stripe_id from User_Stripe table. User not in DB`);
                } else {
                    resolve(result[0].stripe_id)
                }
                connection.release()
            });
        });
        
    });
}

module.exports = {
    addUserStripeConnectedAccount,
    getStripeIdFromUserId
};