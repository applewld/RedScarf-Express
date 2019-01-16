var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var NoticeRouter = require('./routes/notice');
var OrderRouter = require('./routes/order');
var MessageRouter = require('./routes/message');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*"); //允许哪些url可以跨域请求到本域
    res.setHeader("Access-Control-Allow-Methods", "GET,POST"); //允许的请求方法，一般是GET,POST,PUT,DELETE,OPTIONS
    res.setHeader("Access-Control-Allow-Headers", "x-requested-with,content-type,Token"); //允许哪些请求头可以跨域
    // res.error = function (errorCode, errorReason) {
    //     const restResult = new RestResult();
    //     restResult.code = errorCode;
    //     restResult.errorReason = errorReason;
    //     res.send(restResult);
    // };
    //
    // res.success = function (returnValue) {
    //     const restResult = new RestResult();
    //     restResult.code = RestResult.NO_ERROR;
    //     restResult.returnValue = returnValue || {};
    //     res.send(restResult);
    // };
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notice', NoticeRouter);
app.use('/order', OrderRouter);
app.use('/message',MessageRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
