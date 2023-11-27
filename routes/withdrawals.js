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

// curl -i -X POST -d 'userId=165e4426-6cb4-4df9-88ac-091a4be797c3&podId=2da381d8-528e-43aa-b19f-7fd10726b1c5&amt=100' http://localhost:3000/withdrawals
router.post('/', async (req, res) => {
    const userId = req.body.userId;
    const podId = req.body.podId;
    const withdrawalAmount = req.body.amt;
    try {
        await dao.addWithdrawal(userId, withdrawalAmount);
        // TODO : subtract from pod wallet

        res.status(200).json({ success: 'Withdrawal successfully added' })
    } catch (err) {
        res.status(401).json({ error: 'Failed to add withdrawal' })
    }

    // TODO : add to blockchain
});

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
