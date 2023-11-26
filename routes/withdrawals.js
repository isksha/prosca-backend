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

// curl -i -X POST -d 'userId=165e4426-6cb4-4df9-88ac-091a4be797c3&amt=100' http://localhost:3000/withdrawals
router.post('/', async (req, res) => {
    const userId = req.body.userId;
    const withdrawalAmount = req.body.amt;
    try {
        await dao.addWithdrawal(userId, withdrawalAmount);
        res.status(200).json({ success: 'Withdrawal successfully added' })
    } catch (err) {
        res.status(401).json({ error: 'Failed to add withdrawal' })
    }

    // TODO : add to blockchain
});

// ********************************     PUT routes *********************************** //

// used only for withdrawal amount updates
// curl -i -X PUT -d 'amt=150' http://localhost:3000/withdrawals/5fce61ff-c1d0-4b23-9dc7-4146faefc649
router.put('/:withdrawalId', async (req, res) => {
    const newAmount = req.body.amt;
    const withdrawalId = req.params.withdrawalId;

    try {
        await dao.updateWithdrawalAmount(withdrawalId, newAmount);
        res.status(200).json({ success: 'Withdrawal successfully updated' })
    } catch (err) {
        res.status(404).json({error: 'Withdrawal not found'});
    }
});

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
