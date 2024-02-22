const {dbConnection} = require("./dbConnection");

/*
  parameters: user_id
  returns: 1 on success, error message on error
*/
const addUserReputation = async (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO User_Profiles (user_id, peer_score_positive, peer_score_negative) 
        VALUES (?, ?, ?)
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id, 0, 0], (err, result) => {
                if (err) {
                    reject(`Error in addUserReputation: cannot add deposit to Pod_Deposits table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in addUserReputation: no rows were modified when adding user to Pod_Deposits table.`);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            });
        });
    });
}

/*
  parameters: user_id, update_type
  returns: 1 on success, error message on error
*/
const updateUserPeerReputation = async(user_id, update_type) => {
    const update_field = (update_type === "increment") ? "peer_score_positive" : "peer_score_negative";

    return new Promise((resolve, reject) => {
        const query = `
      UPDATE User_Profiles
      SET ${update_field} = ${update_field} + 1
      WHERE user_id = ?
      `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id], (err, result) => {
                if (err) {
                    reject(`Error in addUserReputation: ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`
              Error in addUserReputation: no rows were modified when accepting request from 
              user_id:${user_id}, to user_id:${friend_id} from User_Profiles table.
              `);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            });
        });
    });
}

/*
  parameters: user_id
  returns: row in User_Profiles table on success, error message on error
*/
const getUserReputationById = async (user_id) => {
    return new Promise((resolve, reject) => {
        /*
          User_Profiles (user_id, peer_score)
        */
        const query = `
      SELECT * 
      FROM User_Profiles
      WHERE user_id = ?
    `;
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id], (err, data) => {
                if (err) {
                    reject(`Error in getUserReputationById: cannot get user from Users table. ${err.message}`);
                } else if (data.length === 0) {
                    reject(`Error in getUserReputationById: no rows in the Users table matched user_id: ${user_id}.`);
                } else {
                    resolve(data[0])
                }
                connection.release()
            });
        });
    });
}

module.exports = {
    addUserReputation,
    updateUserPeerReputation,
    getUserReputationById
};