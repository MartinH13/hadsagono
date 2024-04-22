const express = require('express');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let cors = require('cors');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones
const sessinfo = {
    secret: 'clave secreta guau mira que bien aplicacion hadsagono la mejor encriptada',
    cookie: {maxAge: 1000 * 24 * 60 * 60 * 31 * 3}, // 3 meses
    resave: true,
    saveUninitialized: true
};
app.use(session(sessinfo));


let apiRouter= require('./api');
app.use('/', apiRouter);



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