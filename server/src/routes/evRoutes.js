const { Router } = require('express');
const evController = require('../controllers/evController');

const evRouter = Router();

evRouter.get('/', evController.getAll);
evRouter.get('/:evModel', evController.getEvByModel);

module.exports = evRouter;
