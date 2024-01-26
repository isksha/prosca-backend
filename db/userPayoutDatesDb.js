const {dbConnection} = require("./dbConnection");
const common = require('../common/commonFunctionalities');

const addPayoutDate = async (user_id, stripe_id, payout_date, lifetime_id) => {
    return new Promise((resolve, reject) => {
        // User_Payout_Dates(user_id, stripe_id, payout_date)
        const query = `
      INSERT INTO User_Payout_Dates (user_id, stripe_id, payout_date, lifetime_id) 
      VALUES (?, ?, ?, ?)
    `;

        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id, stripe_id, payout_date, lifetime_id], (err, result) => {
                if (err) {
                    reject(`Error in addPayoutDate: cannot add payout date to Pod_Payout_Dates table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in addPayoutDate: no rows were modified when adding payout date to Pod_Payout_Dates table.`);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            });
        });
    });
}


const getPayoutDatesByLifetimeId = async (lifetime_id) => {
    return new Promise((resolve, reject) => {
        // User_Payout_Dates(user_id, stripe_id, payout_date)
        const query = `
      SELECT *
      FROM User_Payout_Dates
      WHERE lifetime_id = ?
    `;

        dbConnection.getConnection((err, connection) => {
            connection.query(query, [lifetime_id], (err, result) => {
                if (err) {
                    reject(`Error in getPayoutDatesByLifetimeId: cannot get payout dates from User_Payout_Dates table. ${err.message}`);
                } else if (result.length === 0) {
                    reject(`Error in getPayoutDatesByLifetimeId: no rows were modified when getting payout dates from User_Payout_Dates table.`);
                } else {
                    resolve(result) // should return 1 on success
                }
                connection.release()
            });
        });
    });

}

module.exports = {
    addPayoutDate,
    getPayoutDatesByLifetimeId
}