const {openConnection, closeConnection} = require("./dbConnection");

/* 
  parameters: none
  returns: entire pods table on success, error message on error/when no pods exist
*/
const getAllPods = async () => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code)
    const query = `
      SELECT * 
      FROM Pods 
    `;
    
    connection.query(query, (err, data) => {
      if (err) {
        reject(`Error in getAllPods: cannot get pods from Pods table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in getAllPods: no rows in the Pods table.`);
      } else {
        console.log(data)
        resolve(data)
      }
    });
    // closeConnection(connection)
  });
};

/* 
  parameters: none
  returns: all open public pod lifetime info on success, error message on error/when no pods exist
*/
const explorePublicPods = async () => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code, pod_size)
    // Pod_Lifetimes(lifetime_id, start_date, pod_id, end_date, recurrence_rate, contribution_amount)
    const query = `
      SELECT * 
      FROM 
        (SELECT pod_id, pod_name, pod_size 
        FROM Pods
        WHERE visibility = ?) AS pods_table
        JOIN
        (SELECT lifetime_id, recurrence_rate, contribution_amount
        FROM Pod_Lifetimes
        WHERE start_date IS NULL) AS pod_lifetimes_table
        ON pods_table.pod_id = pod_lifetimes_table.pod_id
    `;
    
    connection.query(query, [PUBLIC_VISIBILITY_STRING], (err, data) => {
      if (err) {
        reject(`Error in explorePublicPods: cannot get public pods. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in explorePublicPods: no rows in the result.`);
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
    // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code)
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
  parameters: pod_name
  returns: row in Pods table on success, error message on error
*/
const getPodsByName = async (pod_name) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code)
    const query = `
    WITH pods_lifetimes AS (SELECT Pods.pod_id, pod_name, recurrence_rate, contribution_amount, pod_size FROM Pods
    JOIN Pod_Lifetimes PL ON Pods.pod_id = PL.pod_id
    WHERE pod_name LIKE ? AND PL.end_date IS NULL)
    SELECT pods_lifetimes.pod_id, pod_name, recurrence_rate, contribution_amount, COUNT(UP.user_id) AS current_num_members, pod_size FROM pods_lifetimes
    JOIN User_Pods UP ON pods_lifetimes.pod_id = UP.pod_id
    WHERE UP.date_left IS NULL
    GROUP BY pods_lifetimes.pod_id;
    `;
    const pod_name_new = '%' + pod_name + '%';
    connection.query(query, [pod_name_new], (err, data) => {
      if (err) {
        reject(`Error in getPodsByName: cannot get pod from Pods table. ${err.message}`);
      } else if (data.length === 0) {
        reject(`Error in getPodsByName: no rows in the Pods table matched pod_name: ${pod_name}.`);
      } else {
        resolve(data)
      }
    });
    // closeConnection(connection)
  });
};


/*
  parameters: pod_id, name, visibility, creator_id, creation_date, pod_code
  returns: 1 on success, error message on error
*/
const addPod = async(pod_id, name, visibility, creator_id, creation_date, pod_code, pod_size) => {
  const connection = openConnection()
  return new Promise((resolve, reject) => {
    // Pods(pod_id, pod_name, visibility, creator_id, creation date, pod_code)
    const query = `
    INSERT INTO Pods (pod_id, pod_name, visibility, creator_id, creation_date, pod_code, pod_size) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    connection.query(query, [pod_id, name, visibility, creator_id, creation_date, pod_code, pod_size], (err, result) => {
      if (err) {
        reject(`Error in addPod: cannot add pod to Pods table. ${err.message}`);
      } else if (result.affectedRows === 0) {
        reject(`Error in addPod: no rows were modified when adding pod to Pods table. Pod might already exist`);
      } else {
        resolve(result.affectedRows) // should return 1 on success
      }
    });
    // closeConnection(connection)
  });
}


module.exports = {
  getAllPods,
  getPod,
  addPod,
  getPodsByName,
  explorePublicPods
};