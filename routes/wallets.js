const express = require('express');

const router = express.Router();
const common = require('../common/common_functionalities');
const dao = require('../db/dataAccessor');

// ********************************     GET routes *********************************** //
router.get('/:walletId', async (req, res) => {
    const walletId = req.params.walletId;

    const foundWallet = await dao.getWallet(walletId);

    if (foundWallet) {
        // TODO: replace with DB call
        res.status(200).json(foundWallet);
    } else {
        res.status(404).json({error: 'Wallet not found'});
    }
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'walletType=stripe&cardNumber=123456789' http://localhost:3000/wallets
router.post('/', async (req, res) => {
    const walletType = req.body.walletType;
    const walletCardNumber = req.body.cardNumber;

    const newTransactionId = common.generateUniqueId()

    // TODO: DB calls

    res.status(200).json({walletType, walletCardNumber});

    // TODO: error handling
});

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// curl -i -X DELETE http://localhost:3000/wallets/isk
router.delete('/:walletId', async(req, res) => {
    const walletId = req.params.walletId;

    const foundWallet = await dao.getWallet(walletId);
    if (foundWallet) {
        // TODO: replace with DB calls

        res.status(200).json(foundWallet);
    } else {
        res.status(404).json({ error: 'Wallet not found' });
    }
});

// *****************************  Internal helpers *********************************** //

module.exports = router;
