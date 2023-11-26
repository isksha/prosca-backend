const {openConnection, closeConnection} = require("./dbConnection");

const getTransaction = async (podId) => {
    return {1: 2};
}

const consraddTransaction = async(Transaction_Id, amount, date, user_id, pod_id, pod_iteration) => {
    return {1: 2};
}

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
            console.log(data)
            resolve(data)
        }
        });
        // closeConnection(connection)
    });
}

module.exports = {
    getTransaction,
    consraddTransaction,
    getUserLifetimesInfo
};