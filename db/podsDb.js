const {openConnection, closeConnection} = require("./dbConnection");

/* 
  parameters: pod_id
  returns: row in Pods table on success, error message on error
*/
const getPods = async () => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date)
    const query = `
      SELECT * 
      FROM Pods 
    `;
    
    connection.query(query, (err, data) => {
      if (err) {
        reject(`Error in getPod: cannot get pods from Pods table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in getPod: no rows in the Pods table matched pod_id: ${pod_id}.`);
      } else {
        console.log(data)
        resolve(data)
      }
    });
    // closeConnection(connection)
  });
};

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
const addPod = async(pod_id, name, visibility, creator_id, creation_date,pod_code) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date)
    const query = `
    INSERT INTO Pods (pod_id, pod_name, visibility, creator_id, creation_date, pod_code) 
    VALUES (?, ?, ?, ?, ?, ?)
    `
    connection.query(query, [pod_id, name, visibility, creator_id, creation_date, pod_code], (err, result) => {
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

const addCycle = async(cycle_id, start_date, pod_id, recurrence_rate, contribution_amount) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    //Pod_Cycles(cycle_id, start_date, pod_id, end_date, recurrence_rate,contribution_amount)
    const query = `
    INSERT INTO Pod_Cycles (cycle_id, start_date, pod_id, recurrence_rate, contribution_amount) 
    VALUES (?, ?, ?, ?, ?)
    `
    connection.query(query, [cycle_id, start_date, pod_id, recurrence_rate, contribution_amount], (err, result) => {
      if (err) {
        reject(`Error in addCycle: cannot add Cycle to Pod_Cycle Table. ${err.message}`);
      } else if (result.affectedRows === 0) {
        reject(`Error in addCycle: no rows were modified when adding cycle to Pod_Cycle table.`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

const fetchActiveCycle = async(pod_id) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    //Pod_Cycles(cycle_id, start_date, pod_id, end_date, recurrence_rate,contribution_amount)
    const query = `
    SELECT * FROM Pod_Cycles
    WHERE pod_id = ? AND end_date IS NULL
    `
    connection.query(query, [pod_id], (err, data) => {
      if (err) {
        reject(`Error in fetchActiveCycle: cannot fetch active cycle from Pod_Cycle Table. ${err.message}`);
      } else if (data.affectedRows === 0) {
        reject(`Error in fetchActiveCycle: no rows Pod_Cycle table matched pod_id`);
      } else {
        resolve(data[0]) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

const endCycle = async(cycle_id,start_date) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    //Pod_Cycles(cycle_id, start_date, pod_id, end_date, recurrence_rate,contribution_amount)
    const query = `
    UPDATE Pod_Cycles
    SET end_date = NOW()
    WHERE cycle_id = ? AND start_date = ?
    `
    connection.query(query, [cycle_id, start_date], (err, result) => {
      if (err) {
        reject(`Error in addCycle: cannot end Cycle. ${err.message}`);
      } else if (result.affectedRows === 0) {
        reject(`Error in addCycle: no rows were modified when closing cycle to Pod_Cycle table.`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

const getCycleStatement = async(pod_id) => {
}

const getAllPodMembers = async(pod_id) => {

}

module.exports = {
    getPods,
    getPod,
    addCycle,
    fetchActiveCycle,
    endCycle,
    getCycleStatement,
    addPod
};