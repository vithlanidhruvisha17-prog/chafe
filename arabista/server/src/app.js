const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(helmet());

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
