const {openConnection, closeConnection} = require("./dbConnection");

/*
  parameters: lifetime_id, pod_id, recurrence_rate, contribution_amount
  returns: 1 on success, error message on error
*/
const createLifetime = async(lifetime_id, pod_id, recurrence_rate, contribution_amount) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
    const query = `
    INSERT INTO Pod_Lifetimes (lifetime_id, pod_id, recurrence_rate, contribution_amount) 
    VALUES (?, ?, ?, ?)
    `
    connection.query(query, [lifetime_id, pod_id, recurrence_rate, contribution_amount], (err, result) => {
      if (err) {
        console.log(err.message)
        reject(`Error in createLifetime: cannot add lifetime to Pod_Lifetimes Table. ${err.message}`);
      } else if (result.affectedRows === 0) {
        console.log("no affected rows")
        reject(`Error in createLifetime: no rows were modified when adding lifetime to Pod_Lifetimes table. Lifetime might already exist.`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

/*
  parameters: lifetime_id, pod_id, recurrence_rate, contribution_amount
  returns: 1 on success, error message on error
*/
const startLifetime = async(lifetime_id) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
    const query = `
    UPDATE Pod_Lifetimes
    SET start_date = NOW()
    WHERE lifetime_id = ? AND start_date IS NULL
    `
    connection.query(query, [lifetime_id], (err, result) => {
      if (err) {
        reject(`Error in startLifetime: cannot start lifetime in Pod_Lifetimes Table. ${err.message}`);
      } else if (result.affectedRows === 0) {
        reject(`Error in startLifetime: no rows were modified when starting lifetime: ${lifetime_id} in Pod_Lifetimes table.`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}
  
/*
    parameters: pod_id
    returns: row in Pod_Lifetimes table on success, error message on error
*/
const fetchActiveLifetime = async(pod_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
      // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
      const query = `
      SELECT * FROM Pod_Lifetimes
      WHERE pod_id = ? AND start_date IS NOT NULL AND end_date IS NULL
      `
      connection.query(query, [pod_id], (err, data) => {
        if (err) {
          reject(`Error in fetchActiveLifetime: cannot fetch active lifetim of pod_id: ${pod_id} from Pod_Lifetimes Table. ${err.message}`);
        } else if (data.length === 0) {
          reject(`Error in fetchActiveLifetime: no rows in Pod_Lifetimes table matched pod_id: ${pod_id}`);
        } else {
          resolve(data[0]) // should return 1 on success
        }
      });
      // closeConnection(connection)
    });
}

/*
    parameters: pod_id
    returns: row in Pod_Lifetimes table on success, error message on error
*/
const fetchAllPodLifetimes = async(pod_id) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
    const query = `
    SELECT * FROM Pod_Lifetimes
    WHERE pod_id = ?
    `
    connection.query(query, [pod_id], (err, data) => {
      if (err) {
        reject(`Error in fetchAllPodLifetimes: cannot fetch all lifetimes of pod_id: ${pod_id} from Pod_Lifetimes Table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in fetchAllPodLifetimes: no rows in Pod_Lifetimes table matched pod_id: ${pod_id}`);
      } else {
        resolve(data[0]) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}

/*
    parameters: pod_id
    returns: row in Pod_Lifetimes table on success, error message on error
*/
const fetchAllLifetimes = async() => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
    const query = `
    SELECT * FROM Pod_Lifetimes
    `
    connection.query(query, (err, data) => {
      if (err) {
        reject(`Error in fetchAllLifetimes: cannot fetch all lifetimes from Pod_Lifetimes Table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in fetchAllLifetimes: no rows in Pod_Lifetimes table`);
      } else {
        resolve(data[0]) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}
  
/*
    parameters: lifetime_id
    returns: 1 on success, error message on error
*/
const endLifetime = async(lifetime_id) => {
    const connection = openConnection()
    return new Promise((resolve, reject) => {
      // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
      const query = `
      UPDATE Pod_Lifetimes
      SET end_date = NOW()
      WHERE lifetime_id = ? AND start_date IS NOT NULL
      `
      connection.query(query, [lifetime_id, start_date], (err, result) => {
        if (err) {
          reject(`Error in endLifetime: cannot end Lifetime. ${err.message}`);
        } else if (result.affectedRows === 0) {
          reject(`Error in endLifetime: no rows were modified when closing lifetime with id: ${lifetime_id} in Pod_Lifetimes table.`);
        } else {
          resolve(result.affectedRows) // should return 1 on success
        }
      });
      // closeConnection(connection)
    });
}
  
/*
    parameters: pod_id
    returns: _____ on success, error message on error
*/
const getLifetimeStatement = async(pod_id) => {
}

module.exports = {
    createLifetime,
    startLifetime,
    fetchActiveLifetime,
    endLifetime,
    getLifetimeStatement,
    fetchAllPodLifetimes,
    fetchAllLifetimes
};
