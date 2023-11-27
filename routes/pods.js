const express = require('express');

const router = express.Router();
const common = require('../common/common_functionalities');

const dao = require('../db/dataAccessor');
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
        req.foundPod = await dao.getPod(podId);
        next();
    } catch (err) {
        res.status(404).json({ error: 'Pod not found' });
    }
}

// ********************************     GET routes *********************************** //
router.get('/', async (req, res) => {
    try {
        const foundPods = await dao.getAllPods();
        res.status(200).json(foundPods);
    } catch (err) {
        res.status(404).json({error: 'No pods found' });
    }

});

router.get('/lifetimes/', async (req, res) => {

    try {
        const foundLifetimes = await dao.fetchAllLifetimes();
        res.status(200).json(foundLifetimes);
    } catch (err) {
        res.status(404).json({ error: 'Could not get lifetimes for pod' })
    }

});

router.get('/lifetimes/:podId', async (req, res) => {
    const foundPod = req.foundPod;
    const podId = req.params.podId;

    try {
        const foundLifetimes = await dao.fetchAllPodLifetimes(podId);
        res.status(200).json(foundLifetimes);
    } catch (err) {
        res.status(404).json({ error: 'Could not get lifetimes for pod' })
    }

});

router.get('/:podId', checkPodExists, async (req, res) => {
    const foundPod = req.foundPod;

    try {
        // get number of users in pod
        const numUsers = await dao.getPodMembers(req.params.podId);
        foundPod.numUsers = numUsers.length;

        const activeLifetime = await dao.fetchActiveLifetime(req.params.podId);

        foundPod.contributionAmt = activeLifetime.contribution_amount
        foundPod.nextPayment = common.getDateWithOffset(activeLifetime.start_date, activeLifetime.recurrence_rate)

        res.status(200).json(foundPod);
    } catch (err) {
        res.status(401).json({ error: 'Could not get pod' })
    }
});

router.get('/transactions/:podId/', checkPodExists, async(req, res) => {
    const foundPod = req.foundPod;
    res.status(200).json(foundPod);
    // TODO: DB calls
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'pod_name=iskpod8&visibility=private&pod_creator_id=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94&pod_size=3&recur_rate=weekly&contr_amount=50' http://localhost:3000/pods/
router.post('/', async (req, res) => {
    const generatedPodId = common.generateUniqueId();
    const podName = req.body.pod_name;
    const podVisibility = req.body.visibility;
    const podCreatorId = req.body.pod_creator_id;
    const podCreationDate = common.getDate();
    const podCode = generatePodInvitationCode(podVisibility);
    const podSize = req.body.pod_size;

    const generatedLifetimeId = common.generateUniqueId();
    const recurrenceRate = req.body.recur_rate;
    const contributionAmount = req.body.contr_amount;

    try {
        const newPod = await dao.addPod(generatedPodId, podName, podVisibility, podCreatorId, podCreationDate, podCode, podSize);
        const lifetime = await dao.createLifetime(generatedLifetimeId, generatedPodId, recurrenceRate, contributionAmount)
        res.status(200).json( { pod_code : podCode } );
    } catch (err) {
        console.log(err)
        res.status(401).json( { error: 'Failed in creating pod' } );
    }
});

/* ELDA: this is only used when users want to create 
a lifetime in a pod that has already been created (perhaps 
after they finished their initial lifetime and dont have 
an active lifetime) */
// curl -i -X POST -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd&recur_rate=weekly&contr_amount=250' http://localhost:3000/pods/create_lifetime
router.post('/create_lifetime', async (req, res) => {
    const podId = req.body.podId
    const generatedLifetimeId = common.generateUniqueId();
    const recurrenceRate = req.body.recur_rate;
    const contributionAmount = req.body.contr_amount;

    try {
        const lifetime = await dao.createLifetime(generatedLifetimeId, podId, recurrenceRate, contributionAmount)
        res.status(200).json( { success: 'Created lifetime successfully' } );
    } catch (err) {
        res.status(401).json( { error: 'Failed in creating lifetime' } );
    }
});

// ELDA: renew not needed anymore. if users want to 'renew lifeitme, they can recreate it
// curl -i -X POST -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd' http://localhost:3000/pods/renew_lifetime
// router.post('/renew_lifetime', async (req, res) => {
//     const podId = req.body.podId
//     const startDate = common.getDate();

//     try {
//         const activeLifetime = await dao.fetchActiveLifetime(podId)
//         if (activeLifetime !== undefined){
//             const lifetimeClosed = await dao.endLifetime(activeLifetime.lifetime_id,activeLifetime.start_date);
//             console.log(lifetimeClosed)
//             const renewedLifetime = await dao.addLifetime(activeLifetime.lifetime_id, startDate,podId, activeLifetime.recurrence_rate,activeLifetime.contribution_amount);
//             res.status(200).json( { success: 'Renewed lifetime successfully' } );
//         } else{
//             res.status(401).json( { error: 'Pod has no active Lifetimes' } );
//         }
//     } catch (err) {
//         console.log(err)
//         res.status(401).json( { error: 'Failed in renewing lifetime' } );
//     }
// });

// curl -i -X POST -d 'podId=isk' http://localhost:3000/pods/initiate_vote
router.post('/initiate_vote', async(req, res) => {
    const podId = req.body.podId
    const voteId = req.body.voteId

    const foundPod = await dao.getPod(podId);
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

    const foundPod = await dao.getPod(podId);
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

    const foundPod = await dao.getPod(podId);
    if (foundPod) {
        // TODO: replace with DB calls

        res.status(200).json(foundPod);
    } else {
        res.status(404).json({ error: 'Pod not found' });
    }
});

// curl -i -X PUT http://localhost:3000/pods/start_lifetime/060fb2ff-0c43-4ef1-8578-b49b67f08a82
router.put('/start_lifetime/:lifetimeId',  async(req, res) => {
    const lifetimeId = req.params.lifetimeId;

    try {
        const startedLifetime = await dao.startLifetime(lifetimeId);
        res.status(200).json( { success: 'Started lifetime successfully' } );
    } catch (err) {
        res.status(401).json( { error: 'Failed in starting lifetime' } );
    }
});

// ********************************  DELETE routes *********************************** //

// curl -i -X DELETE -d 'podId=0df63043-7204-41a5-ad94-a066db556fcd' http://localhost:3000/pods/end_lifetime
router.delete('/end_lifetime', async (req, res) => {
    const podId = req.body.podId

    try {
        const activeLifetime = await dao.fetchActiveLifetime(podId)
        if (activeLifetime !== undefined){
            const lifetimetoremove = await dao.endLifetime(activeLifetime.lifetime_id,activeLifetime.start_date);
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
