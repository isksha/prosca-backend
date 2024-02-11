const express = require('express');

const router = express.Router();
const common = require('../common/commonFunctionalities');
const dao = require('../db/dataAccessor');

// ********************************     GET routes *********************************** //

router.get('/', async (req, res) => {
    console.log("at chats home");

});
//TO BE COMPLETED:
// When you create a group, a conversation ID is created in the bg
// When you join a group, we look for the conversation id of that pod and you automatically send a message
// to the group telling them you have joined
 

router.get('/user/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {
        // TO BE COMPLETED: CYNTHIA
        const foundConersations = await dao.getAllUserConversations(userId);
        res.status(200).json(foundConversations);
    } catch (err) {
        res.status(404).json({error: 'No conversations found' });
    }

});

router.get('/open_chat/', async (req, res) => {
    const senderId = req.query.sender_id;
    const recipientUser = req.query.recipient_user_id ? req.query.recipient_user_id: null;
    const recipientPod = req.query.recipient_pod_id ? req.query.recipient_pod_id: null;
    
    try {
        const foundConversationID = await dao.findConversationID(senderId,recipientUser,recipientPod);
        
        if(foundConversationID){
             //pull the chats
            const foundConversationMessages = await dao.findConversationMessages(foundConversationID['conversation_id']);

            res.status(200).json(foundConversationMessages);
            
        } else{
            res.status(200).json([]);
        }
       
    } catch (err) {
        res.status(404).json({error: 'Error in opening chat' });
    }

});
// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'senderId=7990f1ed-b1a4-4985-95bf-75ef645b51cf&recipientUser=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94&messageContent=What are you upto&recipientPod=' http://localhost:3000/chats/send_message
router.post('/send_message', async (req, res) => {
    const senderId = req.body.senderId;
    const recipientUser = req.body.recipientUser;
    const recipientPod = req.body.recipientPod;
    const messageContent = req.body.messageContent;
    let foundConversationIDString = "";
    
    try {
        let foundConversationID = await dao.findConversationID(senderId,recipientUser,recipientPod);
        console.log(typeof(foundConversationID));
        if(!foundConversationID){
            // create a new conversation only when first message is sent for one on one conversations
            const convID = common.generateUniqueId();
            const dateJoined = common.getDate();
            try{
                await dao.createConversation(convID, recipientUser, recipientPod, dateJoined);
            } catch (err) {
                console.log(err)
                res.status(401).json({ error: 'Failed to create Conversation!' })
            }
            foundConversationID = await dao.findConversationID(senderId,recipientUser,recipientPod);
            
        }
        foundConversationIDString = foundConversationID['conversation_id'];
        const messageID = common.generateUniqueId();
        const sentDatetime = common.getDate();
        await dao.insertNewMessage(messageID, senderId, messageContent, sentDatetime, foundConversationIDString);
        res.status(200).json({ success: 'Message sent successfully' })
   
    } catch (error) {
        res.status(404).json({error: 'Failed to send Message' });
    }
});

module.exports = router;