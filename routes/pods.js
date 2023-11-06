var express = require('express');
var cors = require("cors");
const { v4: uuidv4 } = require('uuid');

var router = express.Router();
var db =  require('../db/podsDb');

// ********************************     GET routes *********************************** //

router.get('/:podId', async (req, res) => {
    const podId = req.params.podId;

    const foundPod = await db.getPod(podId);

    if (foundPod) {
        // TODO: replace with DB call
        res.status(200).json(foundPod);
    } else {
        res.status(404).json({error: 'Pod not found'});
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

// curl -i -X POST -d 'podName=iskpod&podVisibility=private&podRegulation=splendid' http://localhost:3000/pods
router.post('/', async (req, res) => {
    const podName = req.body.podName;
    const podVisibility = req.body.podVisibility;
    const podRegulation = req.body.podRegulation;

    const newPodId = generateUniquePodId();
    console.log(newPodId);

    // TODO: DB calls

    res.status(200).json({podName, podVisibility, podRegulation});

    // TODO: error handling
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

// curl -i -X POST -d 'podId=isk' http://localhost:3000/pods/form_pod
router.post('/form_pod', async (req, res) => {
    const podId = req.body.podId

    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(401).json({ error: 'Failed to form pod' });
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
router.delete('/:podId', async(req, res) => {
    const podId = req.params.podId;

    const foundPod = await db.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(404).json({ error: 'Pod not found' });
    }
});

// *****************************  Internal helpers *********************************** //

function generatePodInvitationCode() {
}

function generateUniquePodId() {
    return uuidv4();
}

module.exports = router;
