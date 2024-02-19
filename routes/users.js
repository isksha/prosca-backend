const express = require('express');

const router = express.Router();
const common = require('../common/commonFunctionalities');
const dao = require('../db/dataAccessor');
const stripe = require('../payments/stripe');

// *****************************  Internal helpers *********************************** //

// Define a middleware function to check if a user exists
const checkUserExists = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        req.foundUser = await dao.getUserById(userId);
        next();
    } catch (err) {
        res.status(404).json({ error: 'UNF' });
    }
};

const conductPeerReviewUpdate = async (user_id, command_str) => {
    try {
        await dao.getUserById(user_id);
    } catch (err) {
        return res.status(404).json({ error: 'UNF' });
    }
    await dao.updateUserPeerReputation(user_id, command_str);
};

// ********************************     GET routes *********************************** //

router.get('/', async (req, res) => {
    try {
        const foundUsers = await dao.getAllUsers();
        res.status(200).json(foundUsers);
    } catch (err) {
        res.status(404).json({error: 'No users found' });
    }

});

// will search by first name, last name or both
// http://localhost:3000/users/Iskander
// http://localhost:3000/users/Iskanderovic
// http://localhost:3000/users/Iskander Iskanderovic
router.get('/:userName', async (req, res) => {
    const userName = req.params.userName? req.params.userName : "";
    try {
        const foundUsers = await dao.getUsersByName(userName);
        if(foundUsers){
            res.status(200).json(foundUsers);
        }else{
            res.status(404).json({error: 'No users found with given name' });
        }
            
    } catch (err) {
            res.status(404).json({error: `Error : ${err}` });
    }
    
});

// http://localhost:3000/users/suggest_friends/username
router.get('/suggest_friends/:userName', checkUserExists,async (req, res) => {
    const userName = req.params.userName? req.params.userName : "";
    try {
        const foundUsers = await dao.getUsersByName(userName);
        if (foundUsers) {
            const foundUsersLimitedInfo = foundUsers.map(user => {
                return {
                    user_id: user.user_id,
                    first_name: user.first_name, 
                    last_name: user.last_name,
                    score: user.score,
                };
            });
            res.status(200).json(foundUsersLimitedInfo);
        } else {
            res.status(404).json({error: 'No users found with given name' });
        }
            
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

// http://localhost:3000/users/get_friends/thisismyuserid
router.get('/get_friends/:userId', checkUserExists,async (req, res) => {
    const userId = req.params.userId;

    try {
        const foundUser = await dao.getUserById(userId);
        res.status(200).json(foundUser);
    } catch (err) {
        res.status(404).json({ error: `Could not get user with id ${userId}` })
    }
});

// http://localhost:3000/users/get_requests/thisismyuserid
router.get('/get_requests/:userId', checkUserExists,async (req, res) => {
    const firstName = req.params.userId
    try {
        const foundRequests = await dao.getPendingFriendshipRequests(userId);
        if (foundRequests) {
            const requestedUserIds = foundRequests.map(request => request.friendId);
            const friendsInfo = await Promise.all(
                requestedUserIds.map(async uid => await dao.getUserById(uid))).flat();
            res.status(200).json(friendsInfo);
        } else {
            res.status(404).json({error: 'No users found with given name' });
        }
            
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

router.get('/get_pods/:userId', checkUserExists,async (req, res) => {
    const foundUser = req.foundUser;
    const userId = req.params.userId;

    try {
        const foundPods = await dao.getUserPods(userId);
        res.status(200).json(foundPods);
    } catch (err) {
        res.status(404).json({ error: 'Could not get pods for user' })
    }
});

router.get('/get_reputation/:userId', checkUserExists, async (req, res) => {
    try {
        const foundReputation = await dao.getUserReputationById(req.foundUser.user_id);
        res.status(200).json(foundReputation)
    } catch (err) {
        console.log(err)
        res.status(404).json({ error: `Could not increment reputation for user` })
    }
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'email=iska@isk.com&phone=2150000000&fname=Iskander&lname=Iskanderovic&nationalid=hello&dob=01-01-1990&passport=0001&country=CZ' http://localhost:3000/users
router.post('/', async (req, res) => {
    const userEmail = req.body.email
    const userPhone = req.body.phone
    const userFname = req.body.fname
    const userLname = req.body.lname
    const userPassword = common.generateSHA256Hash(req.body.password) // encrypt server-side
    const userDob = req.body.dob
    const userPassport = common.generateSHA256Hash(req.body.nationalid) // encrypt server-side
    const userCountry = req.body.country

    try {
        const userExists = await dao.getUserByEmail(userEmail);
        console.log(userExists)
        if (userExists !== undefined) {
            return res.status(401).json({ error: 'User already exists' });
        }
    } catch (err) {
        return res.status(401).json({ error: 'Failed to add user' });
    }

    const userId = common.generateUniqueId();

    try {
        await dao.addUser(userId, userEmail, userPhone, userFname, userLname, userPassword, userDob, userPassport, userCountry)
        await dao.addUserReputation(userId)
    } catch (err) {
        return res.status(401).json({ error: 'Failed to add user' })
    }

    try {
        const account = await stripe.createStripeConnectedAccount(userId, userEmail, userFname, userLname);
        const acct_link = await stripe.navigateToStripeAuth(account)
        return res.status(200).json({ stripe_acct : acct_link })
    } catch (err) {
        // TODO: handle deleting user from Users table if they were not succesfully associated with a Stripe account
        res.status(401).json({ error: 'Failed to add user: Stripe API error' })
    }
});

// curl -i -X POST -d 'email=iska@isk.com&password=hello' http://localhost:3000/users/authenticate
router.post('/authenticate', async (req, res) => {
    const userEmail = req.body.email
    const userPassword = req.body.password

    const foundUser = await dao.getUserByEmail(userEmail);
    if (foundUser === undefined) {
        res.status(404).json({ error: 'Failed to authenticate user' });
    } else {
        if (foundUser.user_password !== common.generateSHA256Hash(userPassword)) {
            res.status(401).json({ error: 'Incorrect password' });
        } else {
            res.status(200).json(foundUser);
        }
    }
});

// curl -i -X POST -d 'userId=isk' http://localhost:3000/users/update_reputation
router.post('/update_reputation', async (req, res) => {
    const userId = req.body.userId

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to calculate reputation' });
    }
});

// curl -i -X POST -d 'userId=4605edcc-98e6-4548-8ea6-05cce6aeb619' http://localhost:3000/users/increment_peer_review
router.post('/increment_peer_review', async (req, res) => {
    const userId = req.body.userId

    try {
        await conductPeerReviewUpdate(userId, "increment");
        res.status(200).json({ success : 'Incremented reputation successfully' });
    } catch (err) {
        res.status(401).json({ error: 'Failed to increment reputation' });
    }
});


// curl -i -X POST -d 'userId=4605edcc-98e6-4548-8ea6-05cce6aeb619' http://localhost:3000/users/decrement_peer_review
router.post('/decrement_peer_review', async (req, res) => {
    const userId = req.body.userId

    try {
        await conductPeerReviewUpdate(userId, "decrement");
        res.status(200).json({ success : 'Decremented reputation successfully' });
    } catch (err) {
        console.log(err)
        res.status(401).json({ error: 'Failed to decrement reputation' });
    }
});

// curl -i -X POST -d 'userId=isk&podId=iskpod' http://localhost:3000/users/withdraw
router.post('/withdraw', async (req, res) => {
    const userId = req.body.userId
    const podId = req.body.podId

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls
        
        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'User does not exist' });
    }
});

// curl -i -X POST -d 'userId=isk&voteId=sss' http://localhost:3000/users/cast_vote
router.post('/cast_vote', async (req, res) => {
    const userId = req.body.userId
    const voteId = req.body.voteId

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to cast vote' });
    }
});

// curl -i -X POST -d 'userId=isk&voteId=sss' http://localhost:3000/users/withdraw_vote
router.post('/withdraw_vote', async (req, res) => {
    const userId = req.body.userId
    const voteId = req.body.voteId

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to cast vote' });
    }
});

// curl -i -X POST -d 'userId=9bf6574c-6e97-4f05-b0b2-0c06b485b733&user2Id=7990f1ed-b1a4-4985-95bf-75ef645b51cf' http://localhost:3000/users/request_friendship
router.post('/request_friendship', async (req, res) => {
    const userId = req.body.userId
    const user2Id = req.body.user2Id
    const startDatetime = common.getDate()

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        try {
            await dao.postFriendRequest(userId, user2Id, "pending", startDatetime)
            res.status(200).json({ success: 'Request sent successfully' })
        } catch (err) {
            console.log(err)
            res.status(401).json({ error: 'Failed to request friendship!' })
        }
    } else {
        res.status(401).json({ error: 'Failed to request friendship!' });
    }
});

// curl -i -X POST -d 'podId=c91461be-3315-4459-be5c-4211ece2b97a&userId=14fed39c-5d6a-4eca-b2f2-f78f2f547b47&podCode=7IDXGssb7' http://localhost:3000/users/join_pod
router.post('/join_pod', async (req, res) => {
    const podId = req.body.podId
    const userId = req.body.userId
    const dateJoined = common.getDate()
    const podCode = req.body.podCode

    // check if code matches for private pod
    try {
        const foundPod = await dao.getPod(podId);
        if (foundPod.visibility === common.PRIVATE_VISIBILITY_STRING && foundPod.pod_code !== podCode) {
            return res.status(401).json({ error: 'Invalid pod invite code' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Failed to verify invite code' });
    }

    try {
        const addedUserToPod = await dao.addUserToPod(userId, podId, dateJoined)
        const foundConvId = await dao.findPodConversationID(podId);
        if(foundConvId){
            await dao.insertNewMessage(common.generateUniqueId(),userId, 'New User added to pod', dateJoined, foundConvId);
        }
        if (addedUserToPod === 0) {
            res.status(401).json({ error: 'User already in pod' });
        } else {
            res.status(200).json({ success: 'User successfully added to pod' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Failed to add user to pod: ' + err });
    }
})

// manually issue payout to user's bank account
// curl -i -X POST -d 'userId=1cde8141-a015-4bc3-98f6-b383f2540742&userId=c24203d3-1fce-4dc9-9aac-0c42b4499722&payoutAmount=10' http://localhost:3000/users/issue_stripe_payout
router.post('/issue_stripe_payout', async (req, res) => {
    const userId = req.body.userId;
    const payoutAmount = req.body.payoutAmount; // in USD

    try {
        const stripeId = await dao.getStripeIdFromUserId(userId);
        const payout = await stripe.payoutToBankAccount(stripeId, payoutAmount)

        // TODO: store payout in internal DB ??

        res.status(200).json({ success: 'Payout successful' });
    } catch (e) {
        res.status(401).json({ error: 'Failed to issue payout' });
    }
});

// ********************************     PUT routes *********************************** //

// curl -i -X PUT http://localhost:3000/users/isk
router.put('/:userId',  async(req, res) => {
    const userId = req.params.userId;

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ********************************     PATCH routes *********************************** //

// curl -i -X PATCH -d 'userId=9bf6574c-6e97-4f05-b0b2-0c06b485b733&user2Id=7990f1ed-b1a4-4985-95bf-75ef645b51cf' http://localhost:3000/users/accept_friendship
// curl -H 'Content-Type: application/json' -d '{"userId": "9bf6574c-6e97-4f05-b0b2-0c06b485b733", "user2Id": "7990f1ed-b1a4-4985-95bf-75ef645b51cf"}' -X PATCH http://localhost:3000/users/accept_friendship
     
router.patch('/accept_friendship',  async(req, res) => {
    const userId = req.body.userId;
    const user2Id = req.body.user2Id;
    console.log("userId:")
    console.log(req.body);

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
       
        try {
            await dao.acceptFriendRequest(userId, user2Id, "accepted")
            res.status(200).json({ success: 'Friendship successfully added' })
        } catch (err) {
            console.log(err)
            res.status(401).json({ error: 'Failed to add accept friendship' })
        }
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});
// ********************************  DELETE routes *********************************** //

// curl -i -X DELETE http://localhost:3000/users/isk
router.delete('/delete_user/:userId', async(req, res) => {
    const userId = req.params.userId;

    const foundUser = await dao.getUserById(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// curl -i -X DELETE -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd&userId=02ef79a9-c888-4db4-bcc1-319f1e61fe9c' http://localhost:3000/users/leave_pod
router.delete('/leave_pod/', async (req, res) => {
    const podId = req.body.podId;
    const userId = req.body.userId;

    try {
        // try to find if the user is in the pod and fail if not
        const userPods = await dao.getUserPods(userId);
        if (Array.from(userPods).find(userPod => userPod.pod_id === podId) === undefined) {
            return res.status(401).json({ error: 'User not in pod' });
        }

        userToRemove = await dao.removeUserFromPod(userId, podId)
        res.status(200).json({ success: 'User successfully removed from pod' });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Failed to remove user from pod' });
    }
})

// curl -i -X DELETE -d 'userId=9bf6574c-6e97-4f05-b0b2-0c06b485b733&friendId=7990f1ed-b1a4-4985-95bf-75ef645b51cf' http://localhost:3000/users/end_friendship
router.delete('/end_friendship/', async (req, res) => {
    const userId = req.body.userId;
    const friendId = req.body.friendId;

    const foundUser = await dao.getUserById(userId);
    if(foundUser){
        try { 
            friendshipEnd = await dao.endFriendship(userId, friendId)
            res.status(200).json({ success: 'Friendship/requested successfully terminated' });
        } catch (err) {
            console.log(err);
            res.status(401).json({ error: `Failed to end friendship/request between users ${userId} and ${friendId}` });
        }

    } else{
        res.status(401).json({ error: `User ${userId} does not exist !` });
    }

})

module.exports = router;

// demo function - i will erase it soon
router.get('/test/v1/stripe/login/', async (req, res) => {
    const account = await stripe.createStripeConnectedAccount("h", "iskanderrrrrrr@gmail.com", "Jillian", "Tobius");
    const acct_link = await stripe.navigateToStripeAuth(account)
    res.redirect(acct_link)
})

// demo function - i will erase it soon
router.get('/test/v1/stripe/payout/', async (req, res) => {
    const charge = await stripe.chargeStripeAccount('acct_1OUqloFoZunolgPh', 11)
    const pay = await stripe.payStripeAccount('acct_1OUqloFoZunolgPh', 12)
    const payout = await stripe.payoutToBankAccount('acct_1OUqloFoZunolgPh', 13)
    console.log("finished")
    res.status(200).json({ success: 'Payout successful' });
})

