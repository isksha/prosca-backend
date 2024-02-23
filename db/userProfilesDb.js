const {dbConnection} = require("./dbConnection");

/*
  parameters: user_id
  returns: 1 on success, error message on error
*/
const addUserProfile = async (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO User_Profiles (user_id, peer_score_positive, peer_score_negative, user_bio) 
        VALUES (?, ?, ?, ?)
        `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [user_id, 0, 0, null], (err, result) => {
                if (err) {
                    reject(`Error in addUserProfile: cannot add user profile to User_Profiles table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in addUserProfile: no rows were modified when adding user profile to User_Profiles table.`);
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
                    reject(`Error in updateUserReputation: ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in updateUserReputation: no rows were modified.`);
                } else {
                    resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
            });
        });
    });
}

/*
  parameters: user_id, new_bio
  returns: 1 on success, error message on error
*/
const updateUserProfileBio = async(user_id, new_bio) => {
    return new Promise((resolve, reject) => {
        const query = `
      UPDATE User_Profiles
      SET user_bio = ?
      WHERE user_id = ?
      `
        dbConnection.getConnection((err, connection) => {
            connection.query(query, [new_bio, user_id], (err, result) => {
                if (err) {
                    reject(`Error in updateUserProfileBio: ${err.message}`);
                } else if (result.affectedRows === 0) {
                    reject(`Error in updateUserProfileBio: no rows were modified`);
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
const getUserProfileById = async (user_id) => {
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
                    reject(`Error in getUserProfileById: cannot get user from Users_Profiles table. ${err.message}`);
                } else if (data.length === 0) {
                    reject(`Error in getUserProfileById: no rows in the User_Profiles table matched user_id: ${user_id}.`);
                } else {
                    resolve(data[0])
                }
                connection.release()
            });
        });
    });
}

module.exports = {
    addUserProfile,
    updateUserPeerReputation,
    updateUserProfileBio,
    getUserProfileById
};