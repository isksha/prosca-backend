const express = require('express');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const db = require('../db/transactionsDb');

// ********************************     GET routes *********************************** //
router.get('/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;

    const foundWallet = await db.getTransaction(transactionId);

    if (foundWallet) {
        // TODO: replace with DB call
        res.status(200).json(foundWallet);
    } else {
        res.status(404).json({error: 'Transaction not found'});
    }
});

router.get('/blockchain/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;

    const foundWallet = await db.getTransaction(transactionId);

    if (foundWallet) {
        // TODO: replace with DB call
        res.status(200).json(foundWallet);
    } else {
        res.status(404).json({error: 'Transaction not found'});
    }
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'transactionType=withdrawal&transactionDate=20-02-2022' http://localhost:3000/transactions
router.post('/', async (req, res) => {
    const transactionType = req.body.transactionType;
    const transactionDate = req.body.transactionDate;

    const newTransactionId = generateUniqueTransactionId();

    // TODO: DB calls

    res.status(200).json({transactionType, transactionDate});

    // TODO: error handling
});

// curl -i -X POST -d 'transactionType=withdrawal&transactionDate=20-02-2022' http://localhost:3000/transactions/blockchain
router.post('/blockchain', async (req, res) => {
    const transactionType = req.body.transactionType;
    const transactionDate = req.body.transactionDate;

    const newTransactionId = generateUniqueTransactionId();

    // TODO: DB calls

    res.status(200).json({transactionType, transactionDate});

    // TODO: error handling
});

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

function generateUniqueTransactionId() {
    return uuidv4();
}

module.exports = router;
