const {openConnection, closeConnection} = require("./dbConnection");

/* 
  parameters: pod_id
  returns: row in Pods table on success, error message on error
*/
const getPod = async (pod_id) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date)
    const query = `
      SELECT * 
      FROM Pods 
      WHERE pod_id = ?
    `;
    
    connection.query(query, [pod_id], (err, data) => {
      if (err) {
        reject(`Error in getPod: cannot get pod from Pods table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in getPod: no rows in the Pods table matched pod_id: ${pod_id}.`);
      } else {
        resolve(data[0])
      }
    });
    // closeConnection(connection)
  });
};

/*
  parameters: pod_id, name, visibility, creator_id, creation_date
  returns: 1 on success, error message on error
*/
const addPod = async(pod_id, name, visibility, creator_id, creation_date) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date)
    const query = `
    INSERT INTO Pods (pod_id, pod_name, visibility, creator_id, creation_date) 
    VALUES (?, ?, ?, ?, ?)
    `
    connection.query(query, [pod_id, name, visibility, creator_id, creation_date], (err, result) => {
      if (err) {
        reject(`Error in addPod: cannot add pod to Pods table. ${err.message}`);
      } else if (result.affectedRows === 0) {
        reject(`Error in addPod: no rows were modified when adding pod to Pods table.`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

const addCycle = async(pod_id, recurrence_rate, individual_constribution_rate) => {
}

const getCycleStatement = async(pod_id) => {
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
    addPod
};