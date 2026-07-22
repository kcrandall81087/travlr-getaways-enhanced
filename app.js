require('dotenv').config({
  quiet: true
});

const requiredEnvironmentVariables = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName]
);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`
  );
}

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const passport = require('passport');
const cors = require('cors');

const indexRouter = require('./app_server/routes/index');
const usersRouter = require('./app_server/routes/users');
const travelRouter = require('./app_server/routes/travel');
const apiRouter = require('./app_api/routes/index');

const {
  apiNotFoundHandler,
  apiErrorHandler
} = require('./app_api/middleware/errorHandler');

require('./app_api/models/db');
require('./app_api/config/passport');

const app = express();

// ----------------------------------------------------
// View Engine
// ----------------------------------------------------

app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(
  path.join(__dirname, 'app_server', 'views', 'partials')
);

// ----------------------------------------------------
// Handlebars Helpers
// ----------------------------------------------------

hbs.registerHelper('eq', function (left, right) {
  return left === right;
});

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// ----------------------------------------------------
// CORS Configuration
// ----------------------------------------------------

app.use(
  '/api',
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ----------------------------------------------------
// Routes
// ----------------------------------------------------

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

// ----------------------------------------------------
// API Error Handling
// ----------------------------------------------------

app.use('/api', apiNotFoundHandler);
app.use('/api', apiErrorHandler);

// ----------------------------------------------------
// Customer Website Error Handling
// ----------------------------------------------------

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error =
    req.app.get('env') === 'development'
      ? err
      : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;