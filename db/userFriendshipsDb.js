const {dbConnection} = require("./dbConnection");
const common = require('../common/commonFunctionalities');

/* 
  parameters: user_id
  returns: row in User_Friendships table on success, error message on error
*/
const getPendingFriendshipRequests = async (user_id) => {
    return new Promise((resolve, reject) => {
      /*
        User_Friendships (user_id, friend_id, start_datetime, status, end_datetime)
      */
      const query = `
      SELECT * 
      FROM User_Friendships 
      WHERE friend_id = ? AND status = 'pending'
      `;
      dbConnection.getConnection((err, connection) => {
        connection.query(query, [user_id], (err, data) => {
          if (err) {
            console.log("error")
            reject(`Error in getPendingFriendshipRequests: cannot get user from User_Friendships table. ${err.message}`);
          } else if (data.length === 0) {
            console.log("user doesn't exist or doesn't have any pending requests")
            resolve(undefined)
          } else {
            console.log("success")
            resolve(data)
          }
            connection.release()
        });
      });
    });
};

/* 
  parameters: user_id
  returns: row in Users table on success, error message on error
*/
const getUsersFriends = async (user_id) => {
  return new Promise((resolve, reject) => {
    /*
      User_Friendships (user_id, friend_id, start_datetime, status, end_datetime)
    */
    const query = `
      SELECT * 
      FROM User_Friendships 
      WHERE (user_id = ? OR friend_id = ?) AND start_datetime IS NOT NULL AND status = 'accepted';
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [user_id, user_id], (err, data) => {
        if (err) {
          reject(`Error in getUsersFriends: cannot get user from UserFriendships table. ${err.message}`);
        } else if (data.length === 0) {
          reject(`Error in getUsersFriends: no rows in the UserFriendships table matched user_id: ${user_id}.`);
        } else {
          resolve(data)
        }
        connection.release()
      }); 
    });
  });
}

/* 
  parameters: user_id
  returns: row in Users table on success, error message on error
*/
const getFriendRecommendations = async (user_id) => {
  return new Promise((resolve, reject) => {
    /*
      User_Friendships (user_id, friend_id, start_datetime, status, end_datetime)
    */
    const query = `
    SELECT user_id FROM (
      (SELECT pod_id 
      FROM User_Pods
      WHERE user_id = ? AND date_left IS null) AS pods
      JOIN
      User_Pods up
      ON pods.pod_id = up.pod_id
      WHERE date_left IS null
    )
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [user_id], (err, data) => {
        if (err) {
          reject(`Error in getFriendRecommendations: cannot get user from User_Pods table. ${err.message}`);
        } else if (data.length === 0) {
          reject(`Error in getFriendRecommendations: no rows in the User_Pods table matched user_id: ${user_id}.`);
        } else {
          resolve(data)
        }
        connection.release()
      }); 
    });
  });
}


/*
  parameters: user_id, friend_id, status
  returns: 1 on success, error message on error
*/
const postFriendRequest= async (user_id, friend_id, status, start_datetime) => {
    return new Promise((resolve, reject) => {
      /*
        User_Friendships (user_id, friend_id, status, start_datetime, end_datetime)
      */
  
      const query = `
      INSERT INTO User_Friendships (user_id, friend_id, status, start_datetime) 
      VALUES (?, ?, ?, ?)
      `
      dbConnection.getConnection((err, connection) => {
        connection.query(query, [user_id, friend_id, status, start_datetime], (err, result) => {
          if (err) {
            reject(`Error in postFriendRequest: cannot add friend request to User_Friendship table ${err.message}`);
          } else if (result.affectedRows === 0) {
            reject(`Error in addUser: no rows were modified when posting friend request to User_Friendship table.`);
          } else {
            resolve(result.affectedRows) // should return 1 on success
          }
            connection.release()
        });
      });
    });
}
  
/* 
  parameters: user_id, friend_id, status
  returns: 1 on success, error message on error
*/
const acceptFriendRequest = async(user_id, friend_id, status) => {
    return new Promise((resolve, reject) => {
      const query = `
      UPDATE User_Friendships
      SET start_datetime = NOW(), status = ?
      WHERE user_id = ? AND friend_id = ? AND end_datetime is NULL
      `
      dbConnection.getConnection((err, connection) => {
        connection.query(query, [status, user_id, friend_id], (err, result) => {
          if (err) {
              reject(`Error in acceptFriendRequest: ${err.message}`);
          } else if (result.affectedRows === 0) {
              reject(`
              Error in acceptFriendRequest: no rows were modified when accepting request from 
              user_id:${user_id}, to user_id:${friend_id} from User_Friendship table.
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
  parameters: user_id, friend_id, status
  returns: 1 on success, error message on error
*/
const endFriendship = async(user_id, friend_id) => {
    return new Promise((resolve, reject) => {
      const query = `
      UPDATE User_Friendships
      SET end_datetime = NOW()
      WHERE user_id = ? AND friend_id = ? AND end_datetime is NULL
      `
      dbConnection.getConnection((err, connection) => {
        connection.query(query, [user_id, friend_id], (err, result) => {
          if (err) {
              reject(`Error in endFriendship: ${err.message}`);
          } else if (result.affectedRows === 0) {
              reject(`
              Error in endFriendship: no rows were modified when ending friendship between 
              user_id:${user_id} and user_id:${friend_id} from User_Friendship table.
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
  parameters: none
  returns: entire users table on success, error message on error/when no users exist
*/
const getAllFriendships = async () => {
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */
    const query = `
      SELECT * 
      FROM User_Friendships 
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, (err, data) => {
        if (err) {
          reject(`Error in getAllFriendships: cannot get users from User_Friendships table. ${err}`);
        } else if (data.length === 0) {
          reject(`Error in getAllFriendships: no rows in the User_Friendships table.`);
        } else {
          resolve(data)
        }
        connection.release()
      });  
    });
  });
};

module.exports = {
  getPendingFriendshipRequests,
  postFriendRequest,
  acceptFriendRequest,
  endFriendship,
  getUsersFriends,
  getFriendRecommendations,
  getAllFriendships
};