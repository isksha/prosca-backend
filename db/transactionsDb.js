const {openConnection, closeConnection} = require("./dbConnection");
const common = require('../common/common_functionalities');

/********************************     Deposits *********************************** */

const getDeposit = async (transaction_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id)
        const query = `
      SELECT * 
      FROM Pod_Deposits 
      WHERE deposit_id = ?  
    `;
    connection.query(query, [transaction_id], (err, data) => {
        if (err) {
            reject(`Error in getDeposit: cannot get deposit with specified id. ${err}`);
        } else if (data.length === 0) {
            reject(`Error in getAllUsers: no rows in the Pod_Deposits table.`);
        } else {
            resolve(data)
        }
    });
        // closeConnection(connection)
    });
};

/*
  parameters: user_id, transaction_id, deposit_amount
  returns: 1 on success, error message on error
*/
const addDeposit = async (user_id, deposit_amount) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {

        const query = `
    INSERT INTO Pod_Deposits (deposit_id, amount, transaction_date, user_id) 
    VALUES (?, ?, ?, ?)
    `
        connection.query(query, [common.generateUniqueId(), deposit_amount, common.getDate(), user_id], (err, result) => {
            if (err) {
                reject(`Error in addDeposit: cannot add deposit to Pod_Deposits table. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`Error in addDeposit: no rows were modified when adding user to Pod_Deposits table.`);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/*
    parameters: deposit_id, new_amt
    returns: 1 on success, error message on error
*/
const updateDepositAmount = async(deposit_id, new_amt) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id)
        const query = `
        UPDATE Pod_Deposits
        SET amount = ?
        WHERE deposit_id = ?
        `
        connection.query(query, [new_amt, deposit_id], (err, result) => {
            if (err) {
                reject(`Error in updateDepositAmount: cannot update amount for deposit. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`
                Error in updateDepositAmount: no rows were modified when updating 
                deposit_id:${deposit_id} from Pod_Deposits table.
                `);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/********************************     Withdrawals *********************************** */

const getWithdrawal = async (transaction_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // Pod_Withdrawals(transaction_id, amount, transaction_date, user_id)
        const query = `
      SELECT * 
      FROM Pod_Withdrawals 
      WHERE withdrawal_id = ?  
    `;
        connection.query(query, [transaction_id], (err, data) => {
            if (err) {
                reject(`Error in getWithdrawal: cannot get withdrawal with specified id. ${err}`);
            } else if (data.length === 0) {
                reject(`Error in getWithdrawal: no rows in the Pod_Withdrawals table.`);
            } else {
                resolve(data)
            }
        });
        // closeConnection(connection)
    });
};

/*
  parameters: user_id, transaction_id, deposit_amount
  returns: 1 on success, error message on error
*/
const addWithdrawal = async (user_id, withdrawal_amount) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {

        const query = `
    INSERT INTO Pod_Withdrawals (withdrawal_id, amount, transaction_date, user_id) 
    VALUES (?, ?, ?, ?)
    `
        connection.query(query, [common.generateUniqueId(), withdrawal_amount, common.getDate(), user_id], (err, result) => {
            if (err) {
                reject(`Error in addWithdrawal: cannot add withdrawal to Pod_Withdrawals table. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`Error in addWithdrawal: no rows were modified when adding user to Pod_Withdrawals table.`);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/*
    parameters: deposit_id, new_amt
    returns: 1 on success, error message on error
*/
const updateWithdrawalAmount = async(withdrawal_id, new_amt) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // Pod_Withdrawals(transaction_id, amount, transaction_date, user_id)
        const query = `
        UPDATE Pod_Withdrawals
        SET amount = ?
        WHERE withdrawal_id = ?
        `
        connection.query(query, [new_amt, withdrawal_id], (err, result) => {
            if (err) {
                reject(`Error in updateDepositAmount: cannot update amount for deposit. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`
                Error in removeUserFromPod: no rows were modified when updating 
                withdrawal_id:${withdrawal_id} from Pod_Withdrawals table.
                `);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/********************************     Lifetimes *********************************** */

/* 
  parameters: user_id
  returns: list of all pod_lifetime info for user_id on success, error message on error
*/
const getUserLifetimesInfo = async(user_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code)
        // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
        // User_Pods(user_id, pod_id, date_joined, date_left)
        const query = `
        SELECT * 
        FROM
            (SELECT pod_id, pod_size 
            FROM Pods) AS pods_table
            JOIN
            (SELECT start_date, recurrence_rate, contribution_amount
            FROM Pod_Lifetimes) AS pod_lifetimes_table
            ON pods_table.pod_id = pod_lifetimes_table.pod_id
            JOIN
            (SELECT pod_id
            FROM User_Pods
            WHERE user_id = ? AND date_left IS NULL) AS user_pods_table
            ON user_pods_table.pod_id = pod_lifetimes_table.pod_id
        WHERE pod_lifetimes_table.start_date IS NOT NULL
        `;
        
        connection.query(query, [user_id], (err, data) => {
        if (err) {
            reject(`Error in getPods: cannot get pods from Pods table. ${err.message}`);
        } else if (data.length === 0) {
            reject(`Error in getPods: no rows in the Pods table.`);
        } else {
            resolve(data)
        }
        });
        // closeConnection(connection)
    });
}

module.exports = {
    getDeposit,
    addDeposit,
    updateDepositAmount,
    getWithdrawal,
    addWithdrawal,
    updateWithdrawalAmount,
    getUserLifetimesInfo
};