const express = require('express');
const {
    addDriversController,
    driverLoginController,
    getOrdersController,
    getAllOrdersController,
    adminLoginController,
    updateAssignedOrdersController,
    getOnlyPetrolController,
    addAdmin
} = require('../controllers/driver.controller.js');
const { driverTokenValidator } = require('../middlewares/driverTokenValidator.js');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js')

const driverRouter = express.Router();

//admin
// driverRouter.post('/adminlogin', adminLoginController);//working
// driverRouter.post('/addAdmin', addAdmin);// deprecated service
driverRouter.post('/addDrivers', adminTokenValidator, addDriversController,);//frist driver
// driverRouter.post('/updateAssignedOrders', adminTokenValidator, updateAssignedOrdersController);//working


// driverRouter.post('/testing', testingController)//working
driverRouter.get('/getOrders/:phoneNo', driverTokenValidator, getOrdersController);// only assigned orders working
driverRouter.post('/login', driverLoginController);//working
driverRouter.get('/getAllorders', adminTokenValidator, getAllOrdersController);// working
// multiple queries for completed order
// petrol only
driverRouter.get('/getOnlyPetrol/:phoneNo', driverTokenValidator, getOnlyPetrolController)//working perfectly

module.exports = driverRouter