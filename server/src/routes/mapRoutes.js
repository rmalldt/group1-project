const { Router } = require('express');
const mapController = require('../controllers/mapController');

const mapRouter = Router();

mapRouter.get('/isochrone', mapController.getIsochrone);
mapRouter.get('/azure-token', mapController.getAzureToken);

module.exports = mapRouter;
