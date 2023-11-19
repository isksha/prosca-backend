const express = require('express');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const db =  require('../db/podsDb');
const common = require('../common/common_functionalities');

// ********************************     GET routes *********************************** //
router.get('/', async (req, res) => {
    const podId = req.params.podId;

    try {
        const foundPods = await db.getPods();
        if (foundPods) {
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

// curl -i -X POST -d 'pod_name=iskpod&visibility=private&pod_creator_id=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94' http://localhost:3000/pods/
router.post('/', async (req, res) => {
    const generatedPodId = common.generateUniqueId();
    const podName = req.body.pod_name;
    const podVisibility = req.body.visibility;
    const podCreatorId = req.body.pod_creator_id;
    const podCreationDate = common.getDate();
    const podCode = generatePodInvitationCode(podVisibility);

    try {
        const newPod = await db.addPod(generatedPodId, podName, podVisibility, podCreatorId, podCreationDate, podCode);
        res.status(200).json( { success: 'Created pod successfully' } );
    } catch (err) {
        console.log(err)
        res.status(401).json( { error: 'Failed in creating pod' } );
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

function generatePodInvitationCode(podVisibility) {
    if (podVisibility !== common.PRIVATE_VISIBILITY_STRING) {
        return null;
    }

    const rand1 = Math.floor(Math.random() * 9).toString()
    const rand2 = Math.floor(Math.random() * 9).toString()
    const rand3 = Math.floor(Math.random() * 9).toString()
    const rand4 = Math.floor(Math.random() * 9).toString()
    const rand5 = Math.floor(Math.random() * 9).toString()
    return rand1.concat(rand2,rand3,rand4,rand5)
}

module.exports = router;
