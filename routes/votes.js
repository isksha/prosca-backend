const express = require('express');

const router = express.Router();
const dao = require('../db/dataAccessor');
const common = require('../common/commonFunctionalities');

// ********************************     GET routes *********************************** //
router.get('/:voteId', async (req, res) => {
    const voteId = req.params.voteId;

    const foundVote = await dao.getVote(voteId);

    if (foundVote) {
        // TODO: replace with DB call
        res.status(200).json(foundVote);
    } else {
        res.status(404).json({error: 'Vote not found'});
    }
});

// ********************************    POST routes *********************************** //

// curl -i -X POST -d 'voteType=kick' http://localhost:3000/votes
router.post('/', async (req, res) => {
    const isVoteFor = req.body.isVoteFor;
    const voteType = req.body.voteType;

    const newTransactionId = common.generateUniqueId()

    // TODO: DB calls

    res.status(200).json({isVoteFor, voteType})

    // TODO: error handling
});

// curl -i -X POST -d 'isVoteFor=False&voteId=isk' http://localhost:3000/votes/cast_vote
router.post('/cast_vote', async (req, res) => {
    const isVoteFor = req.body.isVoteFor;
    const voteId = req.body.voteId;

    // TODO: DB calls

    res.status(200).json({isVoteFor, voteId});

    // TODO: error handling
});

// curl -i -X POST -d 'voteId=isk' http://localhost:3000/votes/check_termination_and_terminate_conditionally
router.post('/check_termination_and_terminate_conditionally/', async (req, res) => {
    const voteId = req.body.voteId;

    // TODO: DB calls

    res.status(200).json({voteId});

    // TODO: error handling
});

// ********************************     PUT routes *********************************** //

// ********************************  DELETE routes *********************************** //

// *****************************  Internal helpers *********************************** //

module.exports = router;
