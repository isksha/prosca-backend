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
                    reject(`Error in getPayoutDatesByLifetimeId: no rows were retrieved when getting payout dates from User_Payout_Dates table.`);
                } else {
                    resolve(result) // should return 1 on success
                }
                connection.release()
            });
        });
    });

}

const getUpcomingPaymentsForUser = async (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT pl.contribution_amount, pd.payout_date, p.pod_name, p.pod_size, pl.start_date, pl.recurrence_rate, p.pod_id
      FROM User_Pods u
      JOIN Pods p ON u.pod_id = p.pod_id
      JOIN Pod_Lifetimes pl ON p.pod_id = pl.pod_id
      JOIN User_Payout_Dates pd ON pd.lifetime_id = pl.lifetime_id
      WHERE pd.payout_date > NOW() AND pl.start_date IS NOT NULL AND pl.end_date IS NULL AND u.user_id = ?
      ORDER BY pd.payout_date
    `;

        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id], (err, result) => {
                if (err) {
                    reject(`Error in getUpcomingPaymentsForUser: cannot get upcoming payments for userid: ${user_id}. ${err.message}`);
                } else if (result.length === 0) {
                    reject(`Error in getUpcomingPaymentsForUser: no rows were found for upcoming payments for userid: ${user_id}.`);
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
    getPayoutDatesByLifetimeId,
    getUpcomingPaymentsForUser
}