const express = require('express');
const {
    createFuelController,
    getAllfuelsController,
    updateFuelController
} = require('../controllers/fuel.controller');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');
const { authTokenValidator } = require('../middlewares/authTokenValidator.js');


const fuelRouter = express.Router();

fuelRouter.get('/getfuelprices/', authTokenValidator, checkSystemStatusMiddleware, getAllfuelsController);//working
fuelRouter.post('/createOrUpdateFuel', adminTokenValidator, checkSystemStatusMiddleware, createFuelController);//working
// fuelRouter.post('/updateFuel', adminTokenValidator, updateFuelController);//working


module.exports = fuelRouter;