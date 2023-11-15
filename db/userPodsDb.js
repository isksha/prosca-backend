const {openConnection, closeConnection} = require("./dbConnection");

/* 
    parameters: pod_id
    returns: list of User_Pods rows on success, error message on error
*/
const getPodMembers = async(pod_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // User_Pods(user_id, pod_id, date_joined, date_left)
        const query = `
        SELECT * 
        FROM User_Pods 
        WHERE pod_id = ? AND date_left IS NULL
        `
        connection.query(query, [pod_id], (err, data) => {
            if (err) {
                reject(`Error in getPodMembers: cannot get pod members from User_Pods table. ${err.message}`);
            } else if (data.length === 0) {
                reject(`Error in getPodMembers: no rows in the User_Pods table matched pod_id: ${pod_id}.`);
            } else {
                resolve(data)
            }
        });
        // closeConnection(connection)
    });
}

// getPodMembers(1).then((hehe) => console.log("success")).catch((err) => console.log("fail"))


/* 
    parameters: user_id, pod_id, date_joined
    returns: 1 on success, error message on error
*/
const addUserToPod = async(user_id, pod_id, date_joined) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // User_Pods(user_id, pod_id, date_joined, date_left)
        const query = `
        INSERT INTO User_Pods (user_id, pod_id, date_joined) 
        VALUES (?, ?, ?)
        `
        connection.query(query, [user_id, pod_id, date_joined], (err, result) => {
            if (err) {
                reject(`Error in addUserToPod: cannot add user to User_Pods table. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`Error in addUserToPod: no rows were modified when adding user to User_Pods table.`);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/* 
    parameters: user_id, od_id, date_joined
    returns: 1 on success, error message on error
*/
const removeUserFromPod = async(user_id, pod_id, date_joined) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // User_Pods(user_id, pod_id, date_joined, date_left)
        const query = `
        DELETE FROM User_Pods 
        WHERE user_id = ? AND pod_id = ? AND date_joined = ?
        `
        connection.query(query, [user_id, pod_id, date_joined], (err, result) => {
            if (err) {
                reject(`Error in removeUserFromPod: cannot remove user from User_Pods table. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`
                Error in removeUserFromPod: no rows were modified when removing 
                {'user_id':${user_id}, 'pod_id':${pod_id}, 'date_joined':${date_joined}} from User_Pods table.
                `);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}


module.exports = {
    getPodMembers,
    addUserToPod,
    removeUserFromPod
};