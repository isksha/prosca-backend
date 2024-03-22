const {dbConnection} = require("./dbConnection");
const common = require('../common/commonFunctionalities');

/********************************     Deposits *********************************** */

const getDeposit = async (transaction_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id)
        const query = `
        SELECT * 
        FROM Pod_Deposits 
        WHERE deposit_id = ?  
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [transaction_id], (err, data) => {
                if (err) {
                    reject(`Error in getDeposit: cannot get deposit with specified id. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getAllUsers: no rows in the Pod_Deposits table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
};

/*
  parameters: user_id, transaction_id, deposit_amount, pod_id
  returns: 1 on success, error message on error
*/
const addDeposit = async (user_id, deposit_amount, pod_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO Pod_Deposits (deposit_id, amount, transaction_date, user_id, pod_id) 
        VALUES (?, ?, ?, ?, ?)
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [common.generateUniqueId(), deposit_amount, common.getDate(), user_id, pod_id], (err, result) => {
                if (err) {
                    reject(`Error in addDeposit: cannot add deposit to Pod_Deposits table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in addDeposit: no rows were modified when adding user to Pod_Deposits table.`);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            }); 
        });  
    });
}

/*
    parameters: deposit_id, new_amt
    returns: 1 on success, error message on error
*/
const updateDepositAmount = async(deposit_id, new_amt) => {
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        UPDATE Pod_Deposits
        SET amount = ?
        WHERE deposit_id = ?
        `
        dbConnection.getConnection((err, connection) => {
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
                connection.release()
            });
        });
    });
}

const getDepositsByPodId = async (pod_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        SELECT * 
        FROM Pod_Deposits 
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [pod_id], (err, data) => {
                if (err) {
                    reject(`Error in getDepositByPodId: cannot get deposits with specified id. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getDepositByPodId: no rows in the Pod_Deposits table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
}

const getMemberContrAmounts = async (pod_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        SELECT d.user_id, SUM(d.amount), u.first_name, u.last_name
        FROM Pod_Deposits d
        JOIN Users u ON u.user_id = d.user_id
        WHERE d.pod_id = ?
        GROUP BY d.user_id, u.first_name, u.last_name;
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [pod_id], (err, data) => {
                if (err) {
                    reject(`Error in getMemberContrAmounts: cannot get member total contribution amounts for pod. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getMemberContrAmounts: no rows in Pod_deposits join Users table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
}

/********************************     Withdrawals *********************************** */

const getWithdrawal = async (transaction_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Withdrawals(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        SELECT * 
        FROM Pod_Withdrawals 
        WHERE withdrawal_id = ?  
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [transaction_id], (err, data) => {
                if (err) {
                    reject(`Error in getWithdrawal: cannot get withdrawal with specified id. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getWithdrawal: no rows in the Pod_Withdrawals table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
};

/*
  parameters: user_id, transaction_id, deposit_amount, podi_id
  returns: 1 on success, error message on error
*/
const addWithdrawal = async (user_id, withdrawal_amount, pod_id) => {
    return new Promise((resolve, reject) => {

        const query = `
        INSERT INTO Pod_Withdrawals (withdrawal_id, amount, transaction_date, user_id, pod_id) 
        VALUES (?, ?, ?, ?, ?)
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [common.generateUniqueId(), withdrawal_amount, common.getDate(), user_id, pod_id], (err, result) => {
                if (err) {
                    reject(`Error in addWithdrawal: cannot add withdrawal to Pod_Withdrawals table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in addWithdrawal: no rows were modified when adding user to Pod_Withdrawals table.`);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            });
        });
    });
}

const getWithdrawalsByPodId = async (pod_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Withdrawals(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        SELECT * 
        FROM Pod_Withdrawals 
        WHERE pod_id = ?  
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [pod_id], (err, data) => {
                if (err) {
                    reject(`Error in getWithdrawalsByPodId: cannot get withdrawals with specified id. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getWithdrawalsByPodId: no rows in the Pod_Withdrawals table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
}

/********************************  Joined Deposits and Withdrawals  *********************************** */
const getTransactionByPodId = async (pod_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id, pod_id)
        // Pod_Withdrawals(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        SELECT
            w.amount AS amnt,
            w.transaction_date AS transac_date,
            w.user_id AS u_id,
            u.first_name AS f_name,
            u.last_name AS l_name,
            'withdrawal' AS transac_type
        FROM Pod_Withdrawals w
        JOIN Users u ON u.user_id = w.user_id
        WHERE w.pod_id = ?
        UNION
        SELECT
            d.amount AS amnt,
            d.transaction_date AS transac_date,
            d.user_id AS u_id,
            u.first_name AS f_name,
            u.last_name AS l_name,
            'deposit' AS transac_type
        FROM Pod_Deposits d
        JOIN Users u ON u.user_id = d.user_id
        WHERE d.pod_id = ?
        ORDER BY transac_date DESC;
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [pod_id, pod_id], (err, data) => {
                if (err) {
                    reject(`Error in getTransactionByPodId: cannot get transactions with specified id. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getTransactionByPodId: no rows in the Pod_Withdrawals join Pod_Deposits table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
}

const getTransactionByUserId = async (user_id) => {
    return new Promise((resolve, reject) => {
        // Pod_Deposits(transaction_id, amount, transaction_date, user_id, pod_id)
        // Pod_Withdrawals(transaction_id, amount, transaction_date, user_id, pod_id)
        const query = `
        SELECT
            w.amount AS amnt,
            w.transaction_date AS transac_date,
            w.user_id AS u_id,
            p.pod_name AS pod_name,
            'withdrawal' AS transac_type
        FROM Pod_Withdrawals w
        JOIN Pods p ON p.pod_id = w.pod_id
        WHERE w.user_id = ?
        UNION
        SELECT
            d.amount AS amnt,
            d.transaction_date AS transac_date,
            d.user_id AS u_id,
            p.pod_name AS pod_name,
            'deposit' AS transac_type
        FROM Pod_Deposits d
        JOIN Pods p ON p.pod_id = d.pod_id
        WHERE d.user_id = ?
        ORDER BY transac_date DESC;
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id, user_id], (err, data) => {
                if (err) {
                    reject(`Error in getTransactionByUserId: cannot get transactions with specified id. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getTransactionByUserId: no rows in the Pod_Withdrawals join Pod_Deposits table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
}

const getAllTransactions = async () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * 
        FROM Pod_Withdrawals 
        JOIN Pod_Deposits 
        `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, (err, data) => {
                if (err) {
                    reject(`Error in getAllTransactions: cannot get withdrawals or deposits. ${err}`);
                } else if (data.length === 0) {
                    reject(`Error in getAllTransactions: no rows in the Pod_Withdrawals join Pod_Depostis table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
};

/********************************     Lifetimes *********************************** */

/* 
  parameters: user_id
  returns: list of all pod_lifetime info for user_id on success, error message on error
*/
const getUserLifetimesInfo = async(user_id) => {
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
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id], (err, data) => {
                if (err) {
                    reject(`Error in getPods: cannot get pods from Pods table. ${err.message}`);
                } else if (data.length === 0) {
                    reject(`Error in getPods: no rows in the Pods table.`);
                } else {
                    resolve(data)
                }
                connection.release()
            });
        });
    });
}

module.exports = {
    getDeposit,
    addDeposit,
    updateDepositAmount,
    getWithdrawal,
    addWithdrawal,
    getUserLifetimesInfo,
    getWithdrawalsByPodId,
    getDepositsByPodId,
    getTransactionByPodId,
    getMemberContrAmounts,
    getTransactionByUserId,
    getAllTransactions
};