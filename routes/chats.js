const express = require('express');

const router = express.Router();
const common = require('../common/commonFunctionalities');
const dao = require('../db/dataAccessor');

// ********************************     GET routes *********************************** //

router.get('/', async (req, res) => {
    console.log("at chats home");

});

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

// http://localhost:3000/chats/pull_chats/aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94
router.get('/pull_chats/:user_id', async (req, res) => {
    const senderId = req.params.user_id;
    console.log(senderId);
    
    try {
        let oneonOneConversations = await dao.findOneonOneConversations(senderId);
        let groupConversations = await dao.findGroupConversations(senderId);
        
        if(oneonOneConversations || groupConversations){
            //merge the two
            const allConversations = oneonOneConversations.concat(groupConversations);
            let sortedConversationsbyDate = allConversations.sort((obj1, obj2) => { // non-anonymous as you ordered...
                return obj2.name < obj1.name ?  1 // if obj2 should come earlier, push obj1 to end
                     : obj2.name > obj1.name ? -1 // if obj2 should come later, push obj1 to begin
                     : 0;                   // are equal
            });

            res.status(200).json(sortedConversationsbyDate);
            
        } else{
            res.status(200).json([]);
        }
       
    } catch (err) {
        res.status(404).json({error: 'Error in pulling chats' });
    }

});

// http://localhost:3000/chats/open_chat?sender_id=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94&recipient_user_id=&recipient_pod_id=c91461be-3315-4459-be5c-4211ece2b97a
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

// curl -i -X POST -d 'from_user_id=8f0b3553-8920-4013-b8ae-1e453b7c8fb1&recipient_user_id=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94&message_content=Hey Cynthia,this is sara&recipient_pod_id=' http://localhost:3000/chats/send_message
router.post('/send_message', async (req, res) => {
    const senderId = req.body.from_user_id;
    const recipientUser = req.body.recipient_user_id;
    const recipientPod = req.body.recipient_pod_id;
    const messageContent = req.body.message_content;
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
                foundConversationIDString = convID;
            } catch (err) {
                console.log(err)
                res.status(401).json({ error: 'Failed to create Conversation!' })
            }
            
        }else{
            foundConversationIDString = foundConversationID['conversation_id'];
        }
        
        const messageID = common.generateUniqueId();
        const sentDatetime = common.getDate();
        await dao.insertNewMessage(messageID, senderId, messageContent, sentDatetime, foundConversationIDString);
        res.status(200).json({ success: 'Message sent successfully' })
   
    } catch (error) {
        res.status(404).json({error: 'Failed to send Message' });
    }
});

module.exports = router;