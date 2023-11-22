const express = require('express');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const db =  require('../db/podsDb');
const common = require('../common/common_functionalities');

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

// Define a middleware function to check if a pod exists
const checkPodExists = async (req, res, next) => {
    const podId = req.params.podId;
    try {
        req.foundPod = await db.getPod(podId);
        next();
    } catch (err) {
        res.status(404).json({ error: 'Pod not found' });
    }
}

// ********************************     GET routes *********************************** //
router.get('/', async (req, res) => {
    try {
        const foundPods = await db.getPods();
        res.status(200).json(foundPods);
    } catch (err) {
        res.status(404).json({error: 'No pods found' });
    }

});

router.get('/:podId', checkPodExists, async (req, res) => {
    const foundPod = req.foundPod;
    res.status(200).json(foundPod);
});

router.get('/transactions/:podId/', checkPodExists, async(req, res) => {
    const foundPod = req.foundPod;
    res.status(200).json(foundPod);
    // TODO: DB calls
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


// curl -i -X POST -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd&recurrenceRate=weekly&contributionAmount=250' http://localhost:3000/pods/create_lifetime
router.post('/create_lifetime', async (req, res) => {
    const podId = req.body.podId
    const recurrenceRate = req.body.recurrenceRate
    const contributionAmount = parseFloat(req.body.contributionAmount)
    const lifetimeId = common.generateUniqueId();
    const startDate = common.getDate();

    try {
        const newLifetime = await db.createLifetime(lifetimeId, startDate,podId, recurrenceRate,contributionAmount);
        res.status(200).json( { success: 'Created lifetime successfully' } );
    } catch (err) {
        console.log(err)
        res.status(401).json( { error: 'Failed in creating lifetime' } );
    }
});

// curl -i -X POST -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd' http://localhost:3000/pods/renew_lifetime
router.post('/renew_lifetime', async (req, res) => {
    const podId = req.body.podId
    const startDate = common.getDate();

    try {
        const activeLifetime = await db.fetchActiveLifetime(podId)
        if (activeLifetime !== undefined){
            const lifetimeClosed = await db.endLifetime(activeLifetime.lifetime_id,activeLifetime.start_date);
            console.log(lifetimeClosed)
            const renewedLifetime = await db.addLifetime(activeLifetime.lifetime_id, startDate,podId, activeLifetime.recurrence_rate,activeLifetime.contribution_amount);
            res.status(200).json( { success: 'Renewed lifetime successfully' } );
        } else{
            res.status(401).json( { error: 'Pod has no active Lifetimes' } );
        }
    } catch (err) {
        console.log(err)
        res.status(401).json( { error: 'Failed in renewing lifetime' } );
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

// curl -i -X DELETE -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd' http://localhost:3000/pods/end_lifetime
router.delete('/end_lifetime', async (req, res) => {
    const podId = req.body.podId

    try {
        const activeLifetime = await db.fetchActiveLifetime(podId)
        if (activeLifetime !== undefined){
            const lifetimetoremove = await db.endLifetime(activeLifetime.lifetime_id,activeLifetime.start_date);
            res.status(200).json( { success: 'Lifetime closed successfully' } );
        } else{
            res.status(401).json( { error: 'Pod has no active Lifetimes' } );
        }
    } catch (err) {
        console.log(err)
        res.status(401).json( { error: 'Failed in closing lifetime' } );
    }
});

module.exports = router;
