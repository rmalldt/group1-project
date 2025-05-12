const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const userRouter = require('./routes/userRoutes');

const api = express();

api.use(cors());
api.use(express.json());
api.use(logger);

api.get('/', (req, res) => {
  res.json({
    name: 'RangeIQ - Find out about EV battery ranges',
    description:
      'RangeIQ is an application that provides information about on EV battery ranges and capabilities',
  });
});

// api.use('/users', userRouter);

api.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = api;
