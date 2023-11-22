const {openConnection, closeConnection} = require("./dbConnection");
const common = require('../common/common_functionalities');

/* 
  parameters: user_id
  returns: row in Users table on success, error message on error
*/
const getUserById = async (user_id) => {
  const connection = openConnection()
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
    
    connection.query(query, [user_id], (err, data) => {
      if (err) {
        reject(`Error in getUserById: cannot get user from Users table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in getUserById: no rows in the Users table matched user_id: ${user_id}.`);
      } else {
        resolve(data[0])
      }
    });
    // closeConnection(connection)
  });
}

/*
  parameters: email
  returns: row in Users table on success, error message on error
*/
const getUserByEmail = async (email) => {
  const connection = openConnection()
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

    connection.query(query, [email], (err, data) => {
      if (err) {
        reject(`Error in getUserByEmail: cannot get user from Users table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in getUserByEmail: no rows in the Users table matched email_address: ${email}.`);
      } else {
        resolve(data[0])
      }
    });
    // closeConnection(connection)
  });
}

/*
  parameters: user_id, email_address, phone_number, first_name, 
              last_name, password, date_of_birth, national_id, country
  returns: 1 on success, error message on error
*/
const addUser = async (user_id, email_address, phone_number, first_name, last_name, password, date_of_birth, national_id, country) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    /*
      Users (user_id, first_name, last_name, phone, email_address, 
      user_password, date_of_birth, score, national_id, country, wallet_amount)
    */

    const query = `
    INSERT INTO Users (user_id, first_name, last_name, phone, email_address, user_password, date_of_birth, score, national_id, country, wallet_amount) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    connection.query(query, [user_id, first_name, last_name, phone_number, email_address, password, date_of_birth, DEFAULT_USER_SCORE, national_id, country, DEFAULT_WALLET_AMOUNT], (err, result) => {
      if (err) {
        reject(`Error in addUser: cannot add user to Users table. ${err.message}`);
      } else if (result.affectedRows === 0) {
        reject(`Error in addUser: no rows were modified when adding user to Users table. Email address: ${email_address} may already be registered`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

module.exports = {
    getUserById,
    addUser,
    getUserByEmail
};