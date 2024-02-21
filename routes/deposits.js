const express = require('express');

const router = express.Router();
const dao = require('../db/dataAccessor');
const stripe = require("../payments/stripe");

// ********************************     GET routes *********************************** //
router.get('/:depositId', async (req, res) => {
    const transactionId = req.params.depositId;

    try {
        const foundDeposit = await dao.getDeposit(transactionId);
        res.status(200).json(foundDeposit);
    } catch (err) {
        res.status(404).json({error: 'Deposit not found'});
    }
});

router.get('/blockchain/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;

    // check if in internal DB first
    try {
        const foundDeposit = await dao.getDeposit(transactionId);
        res.status(200).json(foundDeposit);
    } catch (err) {
        res.status(404).json({error: 'Deposit not found'});
    }

    // TODO: check if in blockchain
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'user_id=cc18503e-3985-439d-a3a5-ce2da9e0c4e2&pod_id=c91461be-3315-4459-be5c-4211ece2b97a&contribution_amt=50' http://localhost:3000/deposits
router.post('/', async (req, res) => {
    const user = req.body.user_id
    const pod = req.body.pod_id
    const amt = req.body.contribution_amt

    try {
        const deposit = await dao.addDeposit(user, amt, pod);
        res.status(200).json(deposit);
    } catch (err) {
        res.status(404).json({error: 'Deposit not posted'});
    }
});

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
