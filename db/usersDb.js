const {dbConnection} = require("./dbConnection");
const common = require('../common/commonFunctionalities');

/* 
  parameters: user_id
  returns: row in Users table on success, error message on error
*/
const getUserById = async (user_id) => {
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */
    const query = `
      SELECT * 
      FROM Users 
      WHERE user_id = ?
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [user_id], (err, data) => {
        if (err) {
          reject(`Error in getUserById: cannot get user from Users table. ${err.message}`);
        } else if (data.length === 0) {
          reject(`Error in getUserById: no rows in the Users table matched user_id: ${user_id}.`);
        } else {
          resolve(data[0])
        }
      }); 
    });
  });
}

/*
  parameters: email
  returns: row in Users table on success, error message on error
*/
const getUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */
    const query = `
      SELECT * 
      FROM Users 
      WHERE email_address = ?
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [email], (err, data) => {
        if (err) {
          console.log("error")
          reject(`Error in getUserByEmail: cannot get user from Users table. ${err.message}`);
        } else if (data.length === 0) {
          console.log("doesn't exist")
          resolve(undefined)
        } else {
          console.log("success")
          resolve(data[0])
        }
      });    
    });
  });
}

/*
  parameters: user_id, email_address, phone_number, first_name, 
              last_name, password, date_of_birth, national_id, country
  returns: 1 on success, error message on error
*/
const addUser = async (user_id, email_address, phone_number, first_name, last_name, password, date_of_birth, national_id, country) => {
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */

    const query = `
    INSERT INTO Users (user_id, first_name, last_name, phone, email_address, user_password, date_of_birth, score, national_id, country, wallet_amount) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [user_id, first_name, last_name, phone_number, email_address, password, date_of_birth, common.DEFAULT_USER_SCORE, national_id, country, common.WALLET_AMOUNT], (err, result) => {
        if (err) {
          reject(`Error in addUser: cannot add user to Users table. ${err.message}`);
        } else if (result.affectedRows === 0) {
          reject(`Error in addUser: no rows were modified when adding user to Users table. Email address: ${email_address} may already be registered`);
        } else {
          resolve(result.affectedRows) // should return 1 on success
        }
      });  
    });
  });
}

/* 
  parameters: none
  returns: entire users table on success, error message on error/when no users exist
*/
const getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */
    const query = `
      SELECT * 
      FROM Users 
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, (err, data) => {
        if (err) {
          reject(`Error in getAllUsers: cannot get users from Users table. ${err}`);
        } else if (data.length === 0) {
          reject(`Error in getAllUsers: no rows in the Users table.`);
        } else {
          resolve(data)
        }
      });  
    });
  });
};
/* 
  parameters: none
  returns: users with given name on success, error message on error/when no pods exist
*/
const getUsersByName = async (first_name, last_name) => {
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */
      const query = `
      WITH users_nw AS (SELECT user_id, CONCAT(first_name, ' ', last_name) AS user_name, phone, email_address, user_password, date_of_birth,score,national_id,country,wallet_amount FROM Users )
      SELECT * FROM users_nw WHERE user_name LIKE ?;
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [first_name, last_name], (err, data) => {
        if (err) {
          console.log("error")
          reject(`Error in getUsersBy name: cannot get user from Users table. ${err.message}`);
        } else if (data.length === 0) {
          console.log("user doesn't exist")
          resolve(undefined)
        } else {
          console.log("success")
          resolve(data)
        }
      });   
    });
  });
};

module.exports = {
    getUserById,
    addUser,
    getUserByEmail, 
    getAllUsers,
    getUsersByName
};