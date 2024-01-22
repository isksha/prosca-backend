const {openConnection, closeConnection} = require("./dbConnection");
const common = require('../common/commonFunctionalities');

const addPayoutDate = async (user_id, stripe_id, payout_date) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // User_Payout_Dates(user_id, stripe_id, payout_date)
        const query = `
      INSERT INTO User_Payout_Dates (user_id, stripe_id, payout_date) 
      VALUES (?, ?, ?)
    `;
    connection.query(query, [user_id, stripe_id, payout_date], (err, result) => {
        if (err) {
            reject(`Error in storePayoutDates: cannot add payout date to Pod_Payout_Dates table. ${err.message}`);
        } else if (result.affectedRows === 0) {
            reject(`Error in storePayoutDates: no rows were modified when adding payout date to Pod_Payout_Dates table.`);
        } else {
            resolve(result.affectedRows) // should return 1 on success
        }
    });
        // closeConnection(connection)
    });
}

module.exports = {
    addPayoutDate,
}