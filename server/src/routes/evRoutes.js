const { Router } = require('express');
const evController = require('../controllers/evController');

const evRouter = Router();

evRouter.get('/', evController.getAll);
evRouter.get('/model/:model', evController.getEvByModel);
evRouter.get('/brand/:brand', evController.getAllByBrand);

module.exports = evRouter;
