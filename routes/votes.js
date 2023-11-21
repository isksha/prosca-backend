const express = require('express');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const db = require('../db/votesDb');
const {getTransaction} = require("../db/transactionsDb");

// ********************************     GET routes *********************************** //
router.get('/:voteId', async (req, res) => {
    const voteId = req.params.voteId;

    const foundVote = await db.getVote(voteId);

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

    const newTransactionId = generateUniqueVoteId();

    // TODO: DB calls

    res.status(200).json({isVoteFor, voteType});

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

function generateUniqueVoteId() {
    return uuidv4();
}

module.exports = router;
