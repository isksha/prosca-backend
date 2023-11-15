var express = require('express');
var cors = require("cors");
const { v4: uuidv4 } = require('uuid');

var router = express.Router();
var db =  require('../db/podsDb');
var userpod_db =  require('../db/userPodsDb');

// ********************************     GET routes *********************************** //
router.get('/', async (req, res) => {
    const podId = req.params.podId;

    try {
        const foundPods = await db.getPods();
        if (foundPod) {
            // TODO: replace with DB call
            res.status(200).json(foundPods);
        } else {
            res.status(404).json({error: 'No pods found'});
        }
        
    } catch (err) {
        console.log(err);
    }

});

router.get('/:podId', async (req, res) => {
    const podId = req.params.podId;

    try {
        const foundPod = await db.getPod(podId);
        if (foundPod) {
            // TODO: replace with DB call
            res.status(200).json(foundPod);
        } else {
            res.status(404).json({error: 'Pod not found'});
        }
        
    } catch (err) {
        console.log(err);
    }

});

router.get('/transactions/:podId/', async(req, res) => {
    const podId = req.params.podId;

    const foundPod = await db.getPod(podId);

    if (foundPod) {
        // TODO: replace with DB call
        res.status(200).json(foundPod);
    } else {
        res.status(404).json({ error: 'Pod not found' });
    }
});

// ********************************    POST routes *********************************** //

// This route is used to create a new pod
// curl -i -X POST -d 'podName=thefirstpod&podVisibility=private&creatorID=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94' http://localhost:3000/pods/formpod
router.post('/formpod', async (req, res) => {
    const podName = req.body.podName;
    const podVisibility = req.body.podVisibility;
    const creatorID = req.body.creatorID;
    const creationDate = Date() 
    const podCode = generatePodInvitationCode()
    const newPodId = generateUniquePodId();
    
    console.log(newPodId);

    // DB calls
    try {
        addedPod =  await db.addPod(newPodId,podName, podVisibility, creatorID, creationDate, podCode);
        res.status(200).json({ success: 'Pod created successfully' });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Failed to create pod' });
    }
    
});

// curl -i -X POST -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd&userId=02ef79a9-c888-4db4-bcc1-319f1e61fe9c' http://localhost:3000/pods/joinpod
router.post('/joinpod', async (req, res) => {
    const podId = req.body.podId;
    const userId = req.body.userId;
    const dateJoined = Date()

    try {
        addedUsertoPod =  await userpod_db.addUserToPod(userId, podId, dateJoined)
        res.status(200).json({ success: 'User successfully added to pod' });
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Failed to add user to pod' });
    }

 
});

// curl -i -X POST -d 'podId=isk&userId=iskander' http://localhost:3000/pods/kick
router.post('/kick', async (req, res) => {
    const podId = req.body.podId;
    const userToKick = req.body.userId;

    // TODO: DB calls
    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(401).json({ error: 'Failed to kick' });
    }
});


// curl -i -X POST -d 'podId=isk' http://localhost:3000/pods/advance_cycle
router.post('/advance_cycle', async (req, res) => {
    const podId = req.body.podId

    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(401).json({ error: 'Failed to form pod' });
    }
});

// curl -i -X POST -d 'podId=isk' http://localhost:3000/pods/initiate_vote
router.post('/initiate_vote', async(req, res) => {
    const podId = req.body.podId
    const voteId = req.body.voteId

    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(401).json({ error: 'Failed to initiate vote' });
    }
});

// curl -i -X POST -d 'podId=isk&voteId=12' http://localhost:3000/pods/accept_vote_decision
router.post('/accept_vote_decision', async (req, res) => {
    const podId = req.body.podId
    const voteId = req.body.voteId

    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json({podId, voteId});
    } else {
        res.status(401).json({ error: 'Failed to initiate vote' });
    }
});

// ********************************  PUT routes *********************************** //

// curl -i -X PUT http://localhost:3000/pods/isk
router.put('/:podId',  async(req, res) => {
    const podId = req.params.podId;

    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(404).json({ error: 'Pod not found' });
    }
});

// ********************************  DELETE routes *********************************** //

// curl -i -X DELETE http://localhost:3000/pods/isk
// router.delete('/:podId', async(req, res) => {
//     const podId = req.params.podId;

//     const foundPod = await db.getPod(podId);
//     if (foundPod) {
//         // TODO: replace with DB calls

//         res.status(200).json(foundPod);
//     } else {
//         res.status(404).json({ error: 'Pod not found' });
//     }
// });

// *****************************  Internal helpers *********************************** //

function generatePodInvitationCode() {
    const rand1 = Math.floor(Math.random() * 9).toString()
    const rand2 = Math.floor(Math.random() * 9).toString()
    const rand3 = Math.floor(Math.random() * 9).toString()
    const rand4 = Math.floor(Math.random() * 9).toString()
    const rand5 = Math.floor(Math.random() * 9).toString()
    return rand1.concat(rand2,rand3,rand4,rand5)
}

function generateUniquePodId() {
    return uuidv4();
}

module.exports = router;
