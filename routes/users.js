const express = require('express');

const router = express.Router();
const userDb = require('../db/usersDb');
const podDb =  require('../db/podsDb');
const userPodDb =  require('../db/userPodsDb');
const common = require('../common/common_functionalities');

// *****************************  Internal helpers *********************************** //

// Define a middleware function to check if a user exists
const checkUserExists = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        req.foundUser = await userDb.getUser(userId);
        next();
    } catch (err) {
        res.status(404).json({ error: 'User not found' });
    }
};

// ********************************     GET routes *********************************** //
router.get('/:userId', checkUserExists, async (req, res) => {
    const foundUser = req.foundUser;
    res.status(200).json(foundUser);
});

router.get('/suggest_pods/:userId', checkUserExists, async (req, res) => {
    const foundUser = req.foundUser;
    res.status(200).json(foundUser);
    // TODO: suggest pods
});

router.get('/suggest_friends/:userId', checkUserExists,async (req, res) => {
    const foundUser = req.foundUser;
    res.status(200).json(foundUser);
    // TODO: suggest friends
});

router.get('/get_friends/:userId', checkUserExists,async (req, res) => {
    const foundUser = req.foundUser;
    res.status(200).json(foundUser);
    // TODO: get friends
});

router.get('/get_pods/:userId', checkUserExists,async (req, res) => {
    const foundUser = req.foundUser;
    const userId = req.params.userId;

    try {
        const foundPods = await userPodDb.getPodsByUser(userId);
        res.status(200).json(foundPods);
    } catch (err) {
        res.status(404).json({ error: 'Could not get pods for user' })
    }
});

router.get('/check_user_eligibility/:userId/:podId', checkUserExists, async (req, res) => {
    const podId = req.params.podId;
    const userId = req.params.userId;
    // TODO: check pod eligibility
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
    const userNationalId = common.generateSHA256Hash(req.body.nationalid) // encrypt server-side
    const userCountry = req.body.country

    try {
        const userExists = await userDb.getUserByEmail(userEmail);
        console.log(userExists)
        if (userExists !== undefined) {
            return res.status(401).json({ error: 'User already exists' });
        }
    } catch (err) {
        return res.status(401).json({ error: 'Failed to add user' });
    }

    const userId = common.generateUniqueId();

    try {
        await userDb.addUser(userId, userEmail, userPhone, userFname, userLname, userPassword, userDob, userNationalId, userCountry)
        res.status(200).json({ success: 'User successfully added' })
    } catch (err) {
        console.log(err)
        res.status(401).json({ error: 'Failed to add user' })
    }
});

// curl -i -X POST -d 'email=iska@isk.com&password=hello' http://localhost:3000/users/authenticate
router.post('/authenticate', async (req, res) => {
    const userEmail = req.body.email
    const userPassword = req.body.password

    const foundUser = await userDb.getUserByEmail(userEmail);
    if (foundUser === undefined) {
        res.status(404).json({ error: 'Failed to authenticate user' });
    } else {
        if (foundUser.user_password !== common.generateSHA256Hash(userPassword)) {
            res.status(401).json({ error: 'Incorrect password' });
        } else {
            res.status(200).json( { success: 'Successfully logged in user' } );
        }
    }
});

// curl -i -X POST -d 'userId=isk' http://localhost:3000/users/update_reputation
router.post('/update_reputation', async (req, res) => {
    const userId = req.body.userId

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to calculate reputation' });
    }
});

// curl -i -X POST -d 'userId=isk&podId=iskpod' http://localhost:3000/users/withdraw
router.post('/withdraw', async (req, res) => {
    const userId = req.body.userId
    const podId = req.body.podId

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to withdraw' });
    }
});

// curl -i -X POST -d 'userId=isk&voteId=sss' http://localhost:3000/users/cast_vote
router.post('/cast_vote', async (req, res) => {
    const userId = req.body.userId
    const voteId = req.body.voteId

    const foundUser = await userDb.getUser(userId);
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

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to cast vote' });
    }
});

// curl -i -X POST -d 'userId=isk&user2=boon' http://localhost:3000/users/create_friendship
router.post('/create_friendship', async (req, res) => {
    const userId = req.body.userId
    const user2 = req.body.user2

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to make friends' });
    }
});

// curl -i -X POST -d 'userId=isk&user2=boon' http://localhost:3000/users/end_friendship
router.post('/end_friendship', async (req, res) => {
    const userId = req.body.userId
    const user2 = req.body.user2

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to end friendship' });
    }
});

// curl -i -X POST -d 'podId=1cde8141-a015-4bc3-98f6-b383f2540742&userId=c24203d3-1fce-4dc9-9aac-0c42b4499722&podCode=53081' http://localhost:3000/users/join_pod
router.post('/join_pod', async (req, res) => {
    const podId = req.body.podId
    const userId = req.body.userId
    const dateJoined = common.getDate()
    const podCode = parseInt(req.body.podCode)

    // check if code matches for private pod
    try {
        const foundPod = await podDb.getPod(podId);
        if (foundPod.visibility === common.PRIVATE_VISIBILITY_STRING && foundPod.pod_code !== podCode) {
            return res.status(401).json({ error: 'Invalid pod invite pod' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Failed to add user to pod' });
    }

    try {
        const addedUserToPod = await userPodDb.addUserToPod(userId, podId, dateJoined, podCode)
        console.log(addedUserToPod)
        if (addedUserToPod === 0) {
            res.status(401).json({ error: 'User already in pod' });
        } else {
            res.status(200).json({ success: 'User successfully added to pod' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Failed to add user to pod' });
    }
})

// ********************************     PUT routes *********************************** //

// curl -i -X PUT http://localhost:3000/users/isk
router.put('/:userId',  async(req, res) => {
    const userId = req.params.userId;

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ********************************  DELETE routes *********************************** //

// curl -i -X DELETE http://localhost:3000/users/isk
router.delete('/delete_user/:userId', async(req, res) => {
    const userId = req.params.userId;

    const foundUser = await userDb.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// curl -i -X DELETE -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd&userId=02ef79a9-c888-4db4-bcc1-319f1e61fe9c' http://localhost:3000/users/leave_pod
router.delete('/leave_pod/', async (req, res) => {
    console.log("ere")
    const podId = req.body.podId;
    const userId = req.body.userId;

    try {
        // try to find if the user is in the pod and fail if not
        const userPods = await userPodDb.getPodsByUser(userId);
        if (Array.from(userPods).find(userPod => userPod.pod_id === podId) === undefined) {
            return res.status(401).json({ error: 'User not in pod' });
        }

        userToRemove = await userPodDb.removeUserFromPodAlternative(userId, podId)
        res.status(200).json({ success: 'User successfully removed from pod' });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Failed to remove user from pod' });
    }
})

module.exports = router;
