const express = require('express');
const {
    createFuelController,
    getAllfuelsController,
    getAllfuelsAdminController,
    updateFuelController
} = require('../controllers/fuel.controller');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');
const { authTokenValidator } = require('../middlewares/authTokenValidator.js');
const { driverTokenValidator } = require('../middlewares/driverTokenValidator.js');


const fuelRouter = express.Router();

fuelRouter.get('/getfuelprices/', authTokenValidator, checkSystemStatusMiddleware, getAllfuelsController);//working
fuelRouter.get('/getfuelpricesDriver/', driverTokenValidator, checkSystemStatusMiddleware, getAllfuelsAdminController);//working
fuelRouter.get('/getfuelpricesAdmin/', adminTokenValidator, getAllfuelsAdminController);//working
fuelRouter.post('/createOrUpdateFuel', adminTokenValidator, createFuelController);//working
// fuelRouter.post('/updateFuel', adminTokenValidator, updateFuelController);//working


module.exports = fuelRouter;