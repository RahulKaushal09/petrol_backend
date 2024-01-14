const express = require('express');
const {
    addDriversController
} = require('../controllers/driver.controller.js')

const driverRouter = express.Router();

driverRouter.post('/addDrivers', addDriversController,);//working

module.exports = driverRouter