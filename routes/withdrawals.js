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

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
