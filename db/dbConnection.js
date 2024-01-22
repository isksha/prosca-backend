const mysql = require('mysql2')
const config = require('./config.json')

const dbConnection = mysql.createPool({
    host: config.rds_host,
    user: config.rds_username,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});

module.exports = {
    dbConnection
}
