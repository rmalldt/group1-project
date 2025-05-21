const { Router } = require('express');
const mapController = require('../controllers/mapController');

const mapRouter = Router();

mapRouter.get('/azure-token', mapController.getAzureToken);
mapRouter.get('/isochrone', mapController.getIsochrone);
mapRouter.get('/charging-stations', mapController.getChargingStations);

module.exports = mapRouter;
