const {openConnection, closeConnection} = require("./dbConnection");

/* 
  parameters: user_id
  returns: row in Users table on success, error message on error
*/
const getUser = async (user_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        /*
            Users (user_id, first_name, last_name, phone, email_address, 
            user_password, date_of_birth, score, national_id, country)
        */
        const query = `
          SELECT * 
          FROM Users 
          WHERE user_id = ?
        `;
        
        connection.query(query, [user_id], (err, data) => {
          if (err) {
            reject(`Error in getUser: cannot get user from Users table. ${err.message}`);
          } else if (data.length === 0) {
            reject(`Error in getUser: no rows in the Users table matched user_id: ${user_id}.`);
          } else {
            resolve(data[0])
          }
        });
        // closeConnection(connection)
    });
}

/*
  parameters: user_id, email_address, phone_number, first_name, last_name, 
              wallet_ammount, password, date_of_birth, national_id, country
  returns: 1 on success, error message on error
*/
const addUser = async (user_id, email_address, phone_number, first_name, last_name, wallet_ammount, password, date_of_birth, national_id, country) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
        /*
            Users (user_id, first_name, last_name, phone, email_address, 
            user_password, date_of_birth, score, national_id, country)
        */
        const query = `
        INSERT INTO Users (user_id, first_name, last_name, phone, email_address, user_password, date_of_birth, score, wallet_amount, national_id, country) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
        `
        connection.query(query, [user_id, first_name, last_name, phone_number, email_address, password, date_of_birth, national_id, country], (err, result) => {
            if (err) {
                reject(`Error in addUser: cannot add user to Users table. ${err.message}`);
              } else if (result.affectedRows === 0) {
                reject(`Error in addUser: no rows were modified when adding user to Users table.`);
              } else {
                resolve(result.affectedRows) // should return 1 on success
              }
        });
        // closeConnection(connection)
    });
}

module.exports = {
    getUser,
    addUser
};