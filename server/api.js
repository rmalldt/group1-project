const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const path = require('path')

const userRouter = require('./routes/userRoutes');

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:80', 'http://localhost'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger)
app.use('/users', userRouter);

app.use(express.static(path.join(__dirname, "../client/build")))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/login.html'));
});

module.exports = app;
