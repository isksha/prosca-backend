const {openConnection, closeConnection} = require("./dbConnection");

/* 
  parameters: pod_id
  returns: row in Pods table on success, error message on error
*/
const getPodMembers = async (pod_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
      // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code)
      const query = `
      SELECT Users.user_id, first_name, last_name, score FROM User_Pods
      JOIN Users ON Users.user_id = User_Pods.user_id
      WHERE pod_id = ? AND date_left IS NULL
      `;
      
      connection.query(query, [pod_id], (err, data) => {
        if (err) {
          reject(`Error in getPodMembers: cannot get members from User_Pods table. ${err.message}`);
        } else if (data.length === 0) {
          reject(`Error in getPodMembers: no rows in the User_Pods table matched pod_id: ${pod_id}.`);
        } else {
          resolve(data)
        }
      });
      // closeConnection(connection)
    });
  };

/* 
    parameters: user_id, pod_id, date_joined
    returns: 1 on success, error message on error
*/
const addUserToPod = async(user_id, pod_id, date_joined) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // User_Pods(user_id, pod_id, date_joined, date_left)
        // Users already in a pod are not re-added, can be re-added if they left the pod
        const query = `
        INSERT INTO User_Pods (user_id, pod_id, date_joined)
        VALUES (?, ?, ?)
        `
        connection.query(query, [user_id, pod_id, date_joined, user_id, pod_id], (err, result) => {
            if (err) {
                reject(`Error in addUserToPod: cannot add user to User_Pods table. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`Error in addUserToPod: No rows were modified when adding user to User_Pods table.`);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/* 
    parameters: user_id, pod_id
    returns: 1 on success, error message on error
*/
const removeUserFromPod = async(user_id, pod_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        // User_Pods(user_id, pod_id, date_joined, date_left)
        const query = `
        UPDATE User_Pods
        SET date_left = NOW()
        WHERE user_id = ? AND pod_id = ? AND date_left is NULL
        `
        connection.query(query, [user_id, pod_id], (err, result) => {
            if (err) {
                reject(`Error in removeUserFromPod: cannot remove user from pod in User_Pods table. ${err.message}`);
            } else if (result.affectedRows === 0) {
                reject(`
                Error in removeUserFromPod: no rows were modified when removing 
                user_id:${user_id}, pod_id:${pod_id} from User_Pods table.
                `);
            } else {
                resolve(result.affectedRows) // should return 1 on success
            }
        });
        // closeConnection(connection)
    });
}

/*
  parameters: user_id
  returns: pod_ids of pods user iscurrently in on success, error message on error
*/
const getUserPods = async (user_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        /*
            User_Pods(user_id, pod_id, date_joined, date_left)
        */
        const query = `
          SELECT pod_id 
          FROM User_Pods 
          WHERE user_id = ? AND date_left IS NULL
        `;

        connection.query(query, [user_id], (err, data) => {
            if (err) {
                console.log("error")
                reject(`Error in getUserPods: cannot get pods of user with id: ${user_id} from User_Pods table. ${err.message}`);
            } else if (data.length === 0) {
                console.log("empty")
                reject(`Error in getUserPods: no rows in the User_Pods table matched user_id: ${user_id}. User is currently not in any pods`);
            } else {
                console.log("success")
                resolve(data)
            }
        });
        // closeConnection(connection)
    });
}


module.exports = {
    getPodMembers,
    addUserToPod,
    removeUserFromPod,
    getUserPods
};