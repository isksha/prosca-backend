const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require("dotenv").config()

const reputation = require('./reputation/reputationScoreCalculation');

const app = express();

const usersRouter = require('./routes/users');
const podsRouter = require('./routes/pods');
const depositsRouter = require('./routes/deposits');
const withdrawalsRouter = require('./routes/withdrawals');
const chatsRouter = require('./routes/chats');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true, limit : '25mb'}));
app.use(express.json({limit: '50mb'}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/pods', podsRouter);
app.use('/deposits', depositsRouter);
app.use('/withdrawals', withdrawalsRouter);
app.use('/chats', chatsRouter);

reputation.runReputationScoreCalculation().then(r => console.log(r));

module.exports = app;
