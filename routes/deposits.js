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

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
