const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require("dotenv").config();

const app = express();

const usersRouter = require('./routes/users');
const podsRouter = require('./routes/pods');
const votesRouter = require('./routes/votes');
const depositsRouter = require('./routes/deposits');
const withdrawalsRouter = require('./routes/withdrawals');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/pods', podsRouter);
app.use('/votes', votesRouter);
app.use('/deposits', depositsRouter);
app.use('/withdrawals', withdrawalsRouter);

module.exports = app;
