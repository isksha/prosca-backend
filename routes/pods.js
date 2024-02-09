const express = require('express');
const ShortUniqueId = require('short-unique-id');


const router = express.Router();

const common = require('../common/commonFunctionalities');
const paymentScheduling = require('../payments/paymentScheduling');
const dao = require('../db/dataAccessor');
// *****************************  Internal helpers *********************************** //

function generatePodInvitationCode() {
    return new ShortUniqueId().randomUUID(9);
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
        foundPod.nextPayment = common.getDateWithOffset(activeLifetime.start_date, activeLifetime.recurrence_rate, 1)
        foundPod.currCycle = common.getCurrCycle(activeLifetime.start_date, activeLifetime.recurrence_rate)
        res.status(200).json(foundPod);
    } catch (err) {
        res.status(401).json({ error: 'Could not get pod' })
    }
});

// will search by pod name or any key word in the pod name
// http://localhost:3000/pods/search/Finance students Pod
router.get('/search/:podName', async (req, res) => {
    const podName = req.params.podName? req.params.podName : "";
    
    try {
        const foundPods = await dao.getPodsByName(podName);
        if(foundPods){
            res.status(200).json(foundPods);
        }else{
            res.status(404).json({error: 'No pods found with given name' });
        }
            
    } catch (err) {
            res.status(404).json({error: `Error : ${err}` });
    }
    
});

// http://localhost:3000/pods/get_members/223ebd0e-5691-4503-a58a-e161cad6362d
router.get('/get_members/:podID', async (req, res) => {
    const podID = req.params.podID;
    
    try {
        const foundMembers = await dao.getPodMembers(podID);
        if(foundMembers){
            res.status(200).json(foundMembers);
        }else{
            res.status(404).json({error: 'No members present in pod' });
        }
            
    } catch (err) {
            res.status(404).json({error: `Error : ${err}` });
    }
    
});

// gets deposits and withdrawals for the pod
router.get('/transactions/:podId/', checkPodExists, async(req, res) => {
    const pod_id = req.params.podId;

    const withdrawals = await dao.getWithdrawalsByPodId(pod_id);
    const deposits = await dao.getDepositsByPodId(pod_id);
    res.status(200).json({withdrawals, deposits});
});

// gets payout dates for users for current lifetime
router.get('/payout_dates/:lifetime_id/', async(req, res) => {
    const lifetime_id = req.params.lifetime_id;

    try {
        const found_lifetime = await dao.getLifetime(lifetime_id);
        if (found_lifetime) {
            const payouts = await dao.getPayoutDatesByLifetimeId(lifetime_id);
            res.status(200).json({payouts});
        } else{
            res.status(404).json({error: 'Could not get associated lifetime' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Could not get payout dates' })
    }
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'pod_name=iskpod8&visibility=private&pod_creator_id=aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94&pod_size=3&recur_rate=weekly&contr_amount=50' http://localhost:3000/pods/
router.post('/', async (req, res) => {
    const generatedPodId = common.generateUniqueId();
    const podName = req.body.pod_name;
    const podVisibility = req.body.visibility;
    const podCreatorId = req.body.pod_creator_id;
    const podCreationDate = common.getDate();
    const podCode = generatePodInvitationCode();
    const podSize = req.body.pod_size;

    const generatedLifetimeId = common.generateUniqueId();
    const recurrenceRate = req.body.recur_rate;
    const contributionAmount = req.body.contr_amount;

    try {
        const newPod = await dao.addPod(generatedPodId, podName, podVisibility, podCreatorId, podCreationDate, podCode, podSize);
        await dao.addUserToPod(podCreatorId, generatedPodId, podCreationDate)
        const lifetime = await dao.createLifetime(generatedLifetimeId, generatedPodId, recurrenceRate, contributionAmount)
        res.status(200).json( { pod_code : podCode } );
    } catch (err) {
        console.log(err)
        res.status(401).json( { error: 'Failed in creating pod' } );
    }
});

/* this is only used when users want to create 
a lifetime in a pod that has already been created (perhaps 
after they finished their initial lifetime and dont have 
an active lifetime) */
// curl -i -X POST -d 'podId=223ebd0e-5691-4503-a58a-e161cad6362d&recur_rate=monthly&contr_amount=100' http://localhost:3000/pods/create_lifetime
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
        const lifetime = await dao.startLifetime(lifetimeId);
        // const lifetime = await dao.getLifetime('060fb2ff-0c43-4ef1-8578-b49b67f08a82') // await dao.getLifetime('060fb2ff-0c43-4ef1-8578-b49b67f08a82')

        // Schedule payments in Stripe API
        const associatedPodId = lifetime.pod_id
        const recurrenceRate = lifetime.recurrence_rate
        const contributionAmount = lifetime.contribution_amount
        const startDate = lifetime.start_date

        const podMemberIds = (await dao.getPodMembers(associatedPodId)).map(member => member.user_id);
        const potOrderArray = common.generateRandomOrderArray(podMemberIds.length); // can be replaced with another algo
        const depositDatesArray = common.getDepositDates(startDate, recurrenceRate, potOrderArray) // array of arrays, with payment dates for each user

        const numPodMembers = podMemberIds.length

        // for each user in pod, schedule a stripe payout
        for (let i = 0; i < podMemberIds.length; i++) {
            await paymentScheduling.scheduleStripePayout(
                podMemberIds[i],
                numPodMembers * contributionAmount, // winner gets whole pot
                startDate,
                recurrenceRate,
                potOrderArray[i],
                associatedPodId
            );

            // also store the date of the payout for each user in internal db
            // note: not most efficient bc we get stripe id and date in helper above
            const stripe_id = await dao.getStripeIdFromUserId(podMemberIds[i]);
            const payout_date = common.getDateWithOffset(startDate, recurrenceRate, potOrderArray[i]);
            await dao.addPayoutDate(podMemberIds[i], stripe_id, payout_date, lifetimeId);
        }


        // for each user in pod, schedule stripe deposits
        for (let i = 0; i < podMemberIds.length; i++) {
            await paymentScheduling.scheduleStripeCharges(
                podMemberIds[i],
                contributionAmount,
                depositDatesArray[i],
                associatedPodId
            );
        }

        res.status(200).json( { success: 'Started lifetime successfully' } );
    } catch (err) {
        console.log(err)
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
