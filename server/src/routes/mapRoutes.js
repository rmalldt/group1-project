const { Router } = require('express');
const mapController = require('../controllers/mapController');

const mapRouter = Router();

mapRouter.get('/isochrone', mapController.getIsochrone);

module.exports = mapRouter;
