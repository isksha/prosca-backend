const {dbConnection} = require("./dbConnection");

/*
  parameters: conversation_id, recipient_user_id, recipient_pod_id, dateJoined, dateLeft
  returns: 1 on success, error message on error
*/
const createConversation = async (conversation_id, recipient_user_id, recipient_pod_id, dateJoined) => {
    console.log("in create Conversations");
    console.log(recipient_pod_id);
    console.log(recipient_user_id);
    if(!recipient_user_id){
        return new Promise((resolve, reject) => {
            /*
              Conversations (conversation_id, recipient_pod_id, recipient_user_id, joined_datetime, left_datetime)
            */
        
            const query = `
            INSERT INTO Conversations (conversation_id, recipient_pod_id, joined_datetime) 
            VALUES (?, ?, ?)
            `
            dbConnection.getConnection((err, connection) => {
              connection.query(query, [conversation_id,recipient_pod_id, dateJoined], (err, result) => {
                if (err) {
                  reject(`Error in createConversation: cannot add conversation to Conversations table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                  reject(`Error in createConversation: no rows were modified when creating a new conversation user to Conversations table.`);
                } else {
                  resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
              });  
            });
          });

    } else if(!recipient_pod_id){
        console.log(conversation_id);
        return new Promise((resolve, reject) => {
            /*
              Conversations (conversation_id, recipient_pod_id, recipient_user_id, joined_datetime, left_datetime)
            */
        
            const query = `
            INSERT INTO Conversations (conversation_id, recipient_user_id, joined_datetime) 
            VALUES (?, ?, ?)
            `
            dbConnection.getConnection((err, connection) => {
              connection.query(query, [conversation_id,recipient_user_id, dateJoined], (err, result) => {
                if (err) {
                  reject(`Error in createConversation: cannot add conversation to Conversations table. ${err.message}`);
                } else if (result.affectedRows === 0) {
                  reject(`Error in createConversation: no rows were modified when creating a new conversation user to Conversations table.`);
                } else {
                  resolve(result.affectedRows) // should return 1 on success
                }
                connection.release()
              });  
            });
          });
    }
   
  }

/*
  Use this function to find the conversation between a user and another/pod
  parameters: senderID, recipent_userID, recipient_podID
  returns: row in Conversations table on success, error message on error
*/
const findConversationID = async (senderID, recipent_userID, recipient_podID) => {
    
    return new Promise((resolve, reject) => {
     
      const query = `
      SELECT DISTINCT M.conversation_id FROM  Messages M
      JOIN Conversations C on M.conversation_id = C.conversation_id
      WHERE (M.from_user_id = ? AND (recipient_user_id = ? OR recipient_pod_id = ?)) OR (M.from_user_id = ? AND recipient_user_id = ?)
      `;
      dbConnection.getConnection((err, connection) => {
        connection.query(query, [senderID, recipent_userID, recipient_podID, recipent_userID, senderID], (err, data) => {
          if (err) {
            console.log("error")
            reject(`Error in findConversationID:${err.message}`);
          } else if (data.length === 0) {
            console.log("No conversations found")
            resolve(null)
          } else {
            console.log("success in findConversationId")
            resolve(data[0])
          }
          connection.release()
        });    
      });
    });
  }

  /*
  Use this function to find the conversation ID of just a pod
  parameters: senderID, recipent_userID, recipient_podID
  returns: row in Conversations table on success, error message on error
*/
const findPodConversationID = async (recipient_podID) => {
    
  return new Promise((resolve, reject) => {
   
    const query = `
    SELECT conversation_id FROM Conversations
    WHERE recipient_pod_id = ?
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [recipient_podID], (err, data) => {
        if (err) {
          console.log("error: "+ err);
          reject(`Error in findPodConversationID:${err.message}`);
        } else if (data.length === 0) {
          console.log("No conversations found")
          resolve(null)
        } else {
          console.log("success in findPodConversationId")
          resolve(data[0])
        }
        connection.release()
      });    
    });
  });
}


  /*
  parameters: senderID, recipent_userID, recipient_podID
  returns: row in Conversations table on success, error message on error
*/
const findConversationMessages = async (conversationID) => {
    return new Promise((resolve, reject) => {
      
      const query = `
      SELECT from_user_id, message_content, sent_datetime
      FROM Messages WHERE conversation_id = ?
      ORDER BY sent_datetime
      `;
      dbConnection.getConnection((err, connection) => {
        connection.query(query, [conversationID], (err, data) => {
          if (err) {
            console.log("error")
            reject(`Error in findConversationMessages:${err.message}`);
          } else if (data.length === 0) {
            console.log("No conversations found")
            resolve([])
          } else {
            console.log("success")
            resolve(data)
          }
          connection.release()
        });    
      });
    });
  }

   /* TODO 
  parameters: senderID, recipent_userID, recipient_podID
  returns: row in Conversations table on success, error message on error
*/
const findGroupConversations = async (user_id) => {
  return new Promise((resolve, reject) => {
    
    const query = `
    WITH Pod_convos AS(
      SELECT C.conversation_id, recipient_pod_id,joined_datetime FROM Conversations C
      JOIN Messages M on C.conversation_id = M.conversation_id
      WHERE M.from_user_id = ? AND recipient_pod_id IS NOT NULL
      GROUP BY C.conversation_id, recipient_pod_id, joined_datetime)
      SELECT joined_datetime, recipient_pod_id,pod_name AS conversation_name, NULL AS recipient_user_id FROM Pod_convos PC
      JOIN Pods P ON P.pod_id = PC.recipient_pod_id
      ORDER BY joined_datetime DESC;
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [user_id], (err, data) => {
        if (err) {
          console.log("error")
          reject(`Error in findGroupConversations:${err.message}`);
        } else if (data.length === 0) {
          console.log("No group conversations found")
          resolve([])
        } else {
          console.log("success")
          resolve(data)
        }
        connection.release()
      });    
    });
  });
}

const  findOneonOneConversations = async (user_id) => {
  return new Promise((resolve, reject) => {
    
    const query = `
    WITH individual_convos AS(SELECT C.conversation_id, from_user_id, recipient_user_id,joined_datetime FROM Conversations C
      JOIN Messages M on C.conversation_id = M.conversation_id
      WHERE (M.from_user_id =? OR recipient_user_id= ?) AND recipient_pod_id IS NULL
      GROUP BY C.conversation_id,from_user_id, recipient_pod_id, joined_datetime),
      extract_receivers AS(SELECT IF(from_user_id = ?, recipient_user_id, from_user_id) AS receiver_id,conversation_id,joined_datetime FROM individual_convos)
      SELECT  joined_datetime, NULL AS recipient_pod_id, receiver_id AS recipient_user_id, first_name, last_name, score FROM extract_receivers ER
      JOIN Users U ON U.user_id = ER.receiver_id WHERE receiver_id != ?
      ORDER BY joined_datetime DESC;
    `;
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [user_id, user_id, user_id, user_id], (err, data) => {
        if (err) {
          console.log("error")
          reject(`Error in onOneConversations:${err.message}`);
        } else if (data.length === 0) {
          console.log("No one on one conversations found")
          resolve([])
        } else {
          console.log("success")
          resolve(data)
        }
        connection.release()
      });    
    });
  });
}

const insertNewMessage = async (messageID, senderId, messageContent, sentDatetime,conversationID) => {
  return new Promise((resolve, reject) => {
    /*
      Messages(message_id,from_user_id, message_content, sent_datetime, conversation_id)
    */

    const query = `
    INSERT INTO Messages (message_id,from_user_id, message_content, sent_datetime, conversation_id) 
    VALUES (?, ?, ?, ?, ?)
    `
    dbConnection.getConnection((err, connection) => {
      connection.query(query, [messageID, senderId, messageContent,sentDatetime,conversationID ], (err, result) => {
        if (err) {
          reject(`Error in insertNewMessage: cannot add message to Messages table. ${err.message}`);
        } else if (result.affectedRows === 0) {
          reject(`Error in insertNewMessage: no rows were modified when adding message to Messages table.`);
        } else {
          resolve(result.affectedRows) // should return 1 on success
        }
        connection.release()
      });  
    });
  });
}

  module.exports = {
   createConversation,
   findConversationID,
   findPodConversationID,
   findConversationMessages,
   insertNewMessage,
   findGroupConversations,
   findOneonOneConversations,
};