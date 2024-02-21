const express = require('express');

const router = express.Router();
const dao = require('../db/dataAccessor');

// ********************************     GET routes *********************************** //
router.get('/:withdrawalId', async (req, res) => {
    const transactionId = req.params.withdrawalId;

    try {
        const foundWithdrawal = await dao.getWithdrawal(transactionId);
        res.status(200).json(foundWithdrawal);
    } catch (err) {
        res.status(404).json({error: 'Withdrawal not found'});
    }
});

router.get('/blockchain/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;

    // check if in internal DB first
    try {
        const foundWithdrawal = await dao.getWithdrawal(transactionId);
        res.status(200).json(foundWithdrawal);
    } catch (err) {
        res.status(404).json({error: 'Withdrawal not found'});
    }

    // TODO: check if in blockchain
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'user_id=cc18503e-3985-439d-a3a5-ce2da9e0c4e2&pod_id=c91461be-3315-4459-be5c-4211ece2b97a&contribution_amt=250' http://localhost:3000/withdrawals
router.post('/', async (req, res) => {
    const user = req.body.user_id
    const pod = req.body.pod_id
    const amt = req.body.contribution_amt

    try {
        const withdrawal = await dao.addWithdrawal(user, amt, pod);
        res.status(200).json(withdrawal);
    } catch (err) {
        res.status(404).json({error: 'Withdrawal not posted'});
    }
});

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
