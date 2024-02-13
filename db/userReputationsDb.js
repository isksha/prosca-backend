const {dbConnection} = require("./dbConnection");

/*
  parameters: user_id
  returns: 1 on success, error message on error
*/
const addUserReputation = async (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO User_Reputations (user_id, peer_score) 
        VALUES (?, ?)
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id, 0], (err, result) => {
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
    const increment_by = (update_type === "increment") ? 1 : -1;

    return new Promise((resolve, reject) => {
        const query = `
      UPDATE User_Reputations
      SET peer_score = peer_score + ?
      WHERE user_id = ?
      `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [increment_by, user_id], (err, result) => {
                if (err) {
                    reject(`Error in addUserReputation: ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`
              Error in addUserReputation: no rows were modified when accepting request from 
              user_id:${user_id}, to user_id:${friend_id} from User_Reputations table.
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
  returns: row in User_Reputations table on success, error message on error
*/
const getUserReputationById = async (user_id) => {
    return new Promise((resolve, reject) => {
        /*
          User_Reputations (user_id, peer_score)
        */
        const query = `
      SELECT * 
      FROM User_Reputations 
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