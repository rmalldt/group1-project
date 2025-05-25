require('dotenv').config();

const express = require('express');
const cors = require('cors');

const api = require('./api');
const port = process.env.PORT || 3000;

//  Enable CORS (added this line before routes are used) - RAF added for his machine
api.use(cors());

//  Log all incoming requests
api.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

api.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
