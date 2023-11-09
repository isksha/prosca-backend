// establish collection
const mysql = require('mysql2')
const config = require('./config.json')
console.log({
  host: config.rds_host,
  user: config.rds_username,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
})
const connection = mysql.createConnection({
  host: config.rds_host,
  username: config.rds_username,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const getPod = async (podId) => {
    return {1: 3};
}

const addCycle = async(pod_id, recurrence_rate, individual_constribution_rate) => {

}

const getCycleStatement = async(pod_id) => {

}

const addPod = async(pod_id, name, visibility, regulation, creator_id, creation_date) => {

}

const getAllPodMembers = async(pod_id) => {

}

module.exports = {
    getPod,
    addCycle,
    getCycleStatement,
    addPod,
    getAllPodMembers
};