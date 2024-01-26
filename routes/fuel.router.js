const express = require('express');
const {
    createFuelController,
    getAllfuelsController,
    updateFuelController
} = require('../controllers/fuel.controller');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js')


const fuelRouter = express.Router();

fuelRouter.get('/getfuelprices/', getAllfuelsController);//working
fuelRouter.post('/createOrUpdateFuel', adminTokenValidator, createFuelController);//working
// fuelRouter.post('/updateFuel', adminTokenValidator, updateFuelController);//working


module.exports = fuelRouter;