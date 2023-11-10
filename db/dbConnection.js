const mysql = require('mysql2')
const config = require('./config.json')

const openConnection = () => {
    const connection = mysql.createConnection({
        host: config.rds_host,
        user: config.rds_username,
        password: config.rds_password,
        port: config.rds_port,
        database: config.rds_db
    });
    connection.connect((err) => {
        if (err) {
            console.log(`Unable to connect to dbms: ${err}`)
        } else {
            console.log(`Successfully connected to dbms`)
        }
    });
    return connection;
}

const closeConnection = (connection) => {
    connection.end((err) => {
        if (err) {
            console.log(`Unable to disconnect from dbms: ${err}`)
        } else {
            console.log(`Successfully disconnected from dbms`)
        }
    });
}

module.exports = {
    openConnection,
    closeConnection
}
