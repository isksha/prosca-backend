const express = require('express');

const router = express.Router();
const common = require('../common/commonFunctionalities');
const dao = require('../db/dataAccessor');
const stripe = require('../payments/stripe');
const s3 = require('../db/s3querier');

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

router.get('/user_profile/:userId', checkUserExists, async (req, res) => {
    const foundUserProfile = await dao.getUserProfileById(req.foundUser.user_id);
    const mergedUser = { ...req.foundUser, ...foundUserProfile };
    res.status(200).json(mergedUser);
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

router.get('/getAllFriends', async (req, res) => {
    
    try {
        const foundUsers = await dao.getAllFriendships();
        if(foundUsers){
            console.log(foundUsers)
            res.status(200).json(foundUsers);
        }else{
            console.log('not found users')
            res.status(404).json({error: 'No users found with given name' });
        }
            
    } catch (err) {
            res.status(404).json({error: `Error : ${err}` });
    }
    
});

// http://localhost:3000/users/search_friends/username
router.get('/search_friends/:userName', checkUserExists,async (req, res) => {
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

// http://localhost:3000/users/recommend_friends/userId
router.get('/recommend_friends/:userId', checkUserExists,async (req, res) => {
    const userId = req.params.userId? req.params.userId : "";
    try {
        const foundUsers = await dao.getFriendRecommendations(userId);
        const foundFriends = foundUsers.filter(user => user.user_id != userId);
        if (foundFriends) {
            const friendsInfo = await Promise.all(
                foundFriends.map(async user => {
                    return await dao.getUserById(user.user_id);
                }));
            res.status(200).json(friendsInfo);
        } else {
            res.status(404).json({error: 'recommend_friends route: no users found with given name in userFriendships table' });
        }
            
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

// http://localhost:3000/users/get_friends/94b5e11c-9ae3-42f9-b1b2-056c7c52d599
router.get('/get_friends/:userId', checkUserExists,async (req, res) => {
    const userId = req.params.userId? req.params.userId : "";
    try {
        const foundFriends = await dao.getUsersFriends(userId);
        console.log(foundFriends);
        if (foundFriends) {
            const friendsUserIds = foundFriends.map(friend =>{
                if(friend.user_id == userId){
                    return friend.friend_id;
                }else{
                    return friend.user_id;
                }});
            const friendsInfo = await Promise.all(
                friendsUserIds.map(async uid => {
                    if (uid !== userId) { // don't return self as friend
                        return await dao.getUserById(uid);
                    }
                }));
            res.status(200).json(friendsInfo);
        } else {
            res.status(404).json({error: 'get_friends route: no users found with given name in userFriendships table' });
        }
            
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

// *********** http://localhost:3000/users/get_mutual_friends/14f00b4c-cf5f-462a-99d6-99e870953f2d/ee4c9a11-773c-47be-be57-b4cee9a6f250
router.get('/get_mutual_friends/:userId/:friendId',async (req, res) => {
    const friendId = req.params.friendId;
    const userId = req.params.userId;
    if(!userId || !friendId){
        res.status(400).json({error:'Invalid request'});
    }
    try {
        const myFriends = await dao.getUsersFriends(userId);
        console.log(myFriends);
        const theirFriends = await dao.getUsersFriends(friendId);
        if (myFriends && theirFriends) {
            const myfriendsIds = myFriends.map(friend =>{
                if(friend.user_id == userId){
                    return friend.friend_id;
                }else{
                    return friend.user_id;
                }});

            const theirfriendsIds = theirFriends.map(friend =>{
                    if(friend.user_id == friendId){
                        return friend.friend_id;
                    }else{
                        return friend.user_id;
                    }});
            let mutuals = [];
            myfriendsIds.forEach(id => {
                if(theirfriendsIds.includes(id) && (id != userId || id != friendId)){
                    mutuals.push(id);
                }
            });
            if(mutuals.length > 0){
                const mutualfriendsInfo = await Promise.all(
                    mutuals.map(async uid => {
                        return await dao.getUserById(uid);   
                    }));
                res.status(200).json(mutualfriendsInfo);
            } else{
                // send empty array if no mutual friends
                res.status(200).json([]);
            }

        } else {
            res.status(404).json({error: 'error in get_mutual_friends route.' });
        }
            
    } catch (err) {
        res.status(500).json({error: `Error : ${err}` });
    }
});

http://localhost:3000/users/get_requests/68d8f357-415e-4375-9beb-0de09710fecb
router.get('/get_requests/:userId', checkUserExists,async (req, res) => {
    const userId = req.params.userId
    try {
        const foundRequests = await dao.getPendingFriendshipRequests(userId);
        console.log(foundRequests);
        if (foundRequests) {
            const requestedUserIds = foundRequests.map(request => request.user_id);
            const friendsInfo = await Promise.all(
                requestedUserIds.map(async uid => await dao.getUserById(uid)));
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

// gets transaction history for all pods user has participated in
router.get('/myhistory/:userId/', checkUserExists, async(req, res) => {
    const user_id = req.params.userId;
    try {
        const transactions = await dao.getTransactionByUserId(user_id);
        res.status(200).json(transactions);      
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

// gets all transactions
router.get('/transactions/alltransactions/', async(req, res) => {
    try {
        const transactions = await dao.getAllTransactions();
        res.status(200).json(transactions);
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

// gets upcoming payments for active pods user is in
router.get('/upcomingpayments/:userId/', checkUserExists, async(req, res) => {
    const user_id = req.params.userId;
    try {
        const payments = await dao.getUpcomingPaymentsForUser(user_id);
        get_curr_cycle = async x => await dao.getCurrCycle(x['pod_id']);
        new_payments = await Promise.all(payments.map(async old_dict => ({...old_dict, curr_cycle: await get_curr_cycle(old_dict)})));
        res.status(200).json(new_payments);      
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

// retrieves all rows in User_Stripe table
router.get('/stripe/:userId', async(req, res) => {
    try {
        const allStripe = await dao.getAllStripeUsers();
        res.status(200).json(allStripe);      
    } catch (err) {
        res.status(404).json({error: `Error : ${err}` });
    }
});

router.get('/profile_picture/:userId', async(req, res) => {
    const user_id = req.params.userId;

    try {
        const profile_pic = await s3.retrieveProfilePicture(user_id);
        res.writeHead(200, {'Content-Type' : 'image/jpeg; charset=UTF-8'})
        profile_pic.Body.pipe(res);
    } catch (err) {
        res.status(404).json({ error: "Could not load profile picture" });
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

    if (!userFname || !userLname || !userPhone || !userEmail || !req.body.password) {
        return res.status(400).json({ error: 'Some fields are missing' });
    }

    if (!common.EMAIL_REGEX.test(userEmail)) {
        return res.status(405).json({ error: `Invalid email address`})
    }

    if (!common.PHONE_NUMBER_REGEX.test(userPhone)) {
        return res.status(406).json({ error: `Invalid phone number`})
    }

    try {
        const userExists = await dao.getUserByEmail(userEmail);
        console.log("userExists? ", userExists)
        if (userExists !== undefined) {
            return res.status(401).json({ error: 'User already exists' });
        }
    } catch (err) {
        return res.status(404).json({ error: 'Failed to add user' });
    }

    // check password restrictions
    if (!common.PASSWORD_REGEX.test(req.body.password)) {
        return res.status(403).json({ error: `Password doesn't meet requirements`})
    }

    const userId = common.generateUniqueId();

    let stripeId;
    let acct_link;

    try {
        stripeId = await stripe.createStripeConnectedAccount(userId, userEmail, userFname, userLname);
        acct_link = await stripe.navigateToStripeAuth(stripeId)
    } catch (err) {
        // TODO: handle deleting user from Users table if they were not succesfully associated with a Stripe account
        return res.status(402).json({ error: `Failed to add user: Stripe API error ${err}` })
    }

    try {
        await dao.addUser(userId, userEmail, userPhone, userFname, userLname, userPassword, userDob, userPassport, userCountry)
        await dao.addUserProfile(userId)
        if (stripeId) {
            await dao.addUserStripeConnectedAccount(userId, stripeId);
        } else {
            throw Error("Stripe ID is undefined");
        }
        return res.status(200).json({ success: "Succesfully added user", stripe_acct : acct_link })
    } catch (err) {
        return res.status(404).json({ error: 'Failed to add user' })
    }
});

// curl -i -X POST -d 'email=iska@isk.com&password=hello' http://localhost:3000/users/authenticate
router.post('/authenticate', async (req, res) => {
    const userEmail = req.body.email
    const userPassword = req.body.password

    const foundUser = await dao.getUserByEmail(userEmail);
    if (foundUser === undefined) {
        res.status(404).json({ error: 'Authentication failed: no user found' });
    } else {
        if (foundUser.user_password !== common.generateSHA256Hash(userPassword)) {
            res.status(401).json({ error: 'Authentication failed: incorrect password' });
        } else {
            res.status(200).json(foundUser);
        }
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
    const podCode = req.body.podCode? req.body.podCode : null;

    // check if code matches for both private and public codes
    try {
        const foundPod = await dao.getPod(podId);
        if (foundPod.visibility == 'private' & foundPod.pod_code !== podCode) {
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

// CALL THIS TO BOTH UPLOAD AND UPDATE PROFILE PICTURE
// curl -X POST -H "Content-Type: application/json" -d '{"userId" : "14fed39c-5d6a-4eca-b2f2-f78f2f547b47", "profilePic" : ""}' http://localhost:3000/users/user_profile_picture
router.post('/user_profile_picture', async(req, res) => {
    const user_id = req.body.userId;
    const profile_pic = req.body.profilePic;

    try {
        await s3.storeProfilePicture(user_id, profile_pic);
        res.status(200).json({success: `Profile picture stored` });
    } catch (err) {
        res.status(404).json({error: `Could not upload profile picture` });
    }
});

// curl -i -X POST -d 'userId=f62ae581-a33f-480d-a015-d538b968db1a&bio=Hello World!\n My name is Alex...\n I like salami :>' http://localhost:3000/users/post_user_bio
router.post('/post_user_bio', async(req, res) => {
    const user_id = req.body.userId;
    const user_bio = req.body.bio;

    try {
        await dao.updateUserProfileBio(user_id, user_bio);
        res.status(200).json({success: `User bio updated` });
    } catch (err) {
        res.status(404).json({error: `Could not update user bio` });
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
 //userId1 is the user the request is from and userId2 is the user the request was sent to    
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

// curl -i -X DELETE -d 'userId=9bf6574c-6e97-4f05-b0b2-0c06b485b733&user2Id=7990f1ed-b1a4-4985-95bf-75ef645b51cf' http://localhost:3000/users/end_friendship
router.delete('/end_friendship/', async (req, res) => {
    const userId = req.body.userId;
    const user2Id = req.body.user2Id;

    const foundUser = await dao.getUserById(userId);
    if(foundUser){
        try { 
            friendshipEnd = await dao.endFriendship(userId, user2Id)
            res.status(200).json({ success: 'Friendship/requested successfully terminated' });
        } catch (err) {
            console.log(err);
            res.status(401).json({ error: `Failed to end friendship/request between users ${userId} and ${user2Id}` });
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

