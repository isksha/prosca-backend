var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var usersRouter = require('./routes/users');
var podsRouter = require('./routes/pods');
var votesRouter = require('./routes/votes');
var walletsRouter = require('./routes/wallets');
var transactionsRouter = require('./routes/transactions');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/pods', podsRouter);
app.use('/votes', votesRouter);
app.use('/wallets', walletsRouter);
app.use('/transactions', transactionsRouter);

module.exports = app;
