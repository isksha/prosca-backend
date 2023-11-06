const express = require('express');
const cors = require("cors");

const router = express.Router();
const db = require('../db/usersDb');

// ********************************     GET routes *********************************** //
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (foundUser) {
        // TODO: replace with DB call
        res.status(200).json(foundUser);
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

router.get('/suggest_pods/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (foundUser) {
        // TODO: replace with DB call
        res.status(200).json(foundUser);
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

router.get('/suggest_friends/:userId', async (req, res) => {
    const userId = req.params.userId;

    const foundUser = await db.getUser(userId);

    if (foundUser) {
        // TODO: replace with DB call
        res.status(200).json(foundUser);
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

router.get('/get_friends/:userId', async (req, res) => {
    const userId = req.params.userId;

    const foundUser = await db.getUser(userId);

    if (foundUser) {
        // TODO: replace with DB call
        res.status(200).json(foundUser);
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

router.get('/check_user_eligibility/:userId/:podId', async (req, res) => {
    const podId = req.params.podId;
    const userId = req.params.userId;

    const foundUser = await db.getUser(userId);

    if (foundUser) {
        // TODO: replace with DB call
        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'Pod not found' });
    }
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'username=iskpod&userScore=200&userPhone=200&userFname=isk&userLname=shan&userPass=hello&userDOB=01-01-2020' http://localhost:3000/users
router.post('/', async (req, res) => {
    const userName = req.body.username;
    const userScore = req.body.userScore;
    const userPhone = req.body.userPhone;
    const userFname = req.body.userFname;
    const userLname = req.body.userLname;
    const userPass = req.body.userPass;
    const userDOB = req.body.userDOB;

    // TODO: DB calls

    res.status(200).json({userLname, userDOB, userFname, userPhone, userName, userScore, userPass});

    // TODO: error handling
});

// curl -i -X POST -d 'userId=isk' http://localhost:3000/users/authenticate
router.post('/authenticate', async (req, res) => {
    const userId = req.body.userId

    const foundUser = await db.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to authenticate user' });
    }
});

// curl -i -X POST -d 'userId=isk' http://localhost:3000/users/calculate_reputation
router.post('/calculate_reputation', async (req, res) => {
    const userId = req.body.userId

    const foundUser = await db.getUser(userId);
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

    const foundUser = await db.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to withdraw' });
    }
});

// curl -i -X POST -d 'userId=isk&podId=iskpod' http://localhost:3000/users/withdraw
router.post('/withdraw', async (req, res) => {
    const userId = req.body.userId
    const podId = req.body.podId

    const foundUser = await db.getUser(userId);
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

    const foundUser = await db.getUser(userId);
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

    const foundUser = await db.getUser(userId);
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

    const foundUser = await db.getUser(userId);
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

    const foundUser = await db.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to end friendship' });
    }
});

// curl -i -X POST -d 'userId=isk&podId=iskpod' http://localhost:3000/users/join_pod
router.post('/join_pod', async (req, res) => {
    const userId = req.body.userId
    const podId = req.body.podId

    const foundUser = await db.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to join pod' });
    }
});

// curl -i -X POST -d 'userId=isk&podId=iskpod' http://localhost:3000/users/leave_pod
router.post('/leave_pod', async (req, res) => {
    const userId = req.body.userId
    const podId = req.body.podId

    const foundUser = await db.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls, possibly other route calls

        res.status(200).json(foundUser);
    } else {
        res.status(401).json({ error: 'Failed to leave pod' });
    }
});

// ********************************     PUT routes *********************************** //

// curl -i -X PUT http://localhost:3000/users/isk
router.put('/:userId',  async(req, res) => {
    const userId = req.params.userId;

    const foundUser = await db.getUser(userId);
    if (foundUser) {
    const foundUser = await db.getUser(userId);
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ********************************  DELETE routes *********************************** //

// curl -i -X DELETE http://localhost:3000/users/isk
router.delete('/:userId', async(req, res) => {
    const userId = req.params.userId;

    const foundUser = await db.getUser(userId);
    if (foundUser) {
        // TODO: replace with DB calls

        res.status(200).json(foundUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// *****************************  Internal helpers *********************************** //


module.exports = router;
