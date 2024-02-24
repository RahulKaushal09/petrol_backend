const express = require('express');
const {
    addDriversController,
    driverLoginController,
    getOrdersController,
    getOrdersBulkController,
    getAllOrdersController,
    adminGetSystemStatus,
    getAllOrdersCompleteController,
    adminLoginController,
    adminSystemStatus,
    getAllOrderNumberController,
    getOrdersNormalController,
    getDriversController,
    updateAssignedOrdersController,
    getOnlyPetrolController,
    addAdmin
} = require('../controllers/driver.controller.js');
const { driverTokenValidator } = require('../middlewares/driverTokenValidator.js');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');

const driverRouter = express.Router();

//admin
// driverRouter.post('/adminlogin', adminLoginController);//working
driverRouter.get('/getSystemStatus', adminTokenValidator, adminGetSystemStatus);//working
driverRouter.post('/changeSystemStatus', adminTokenValidator, adminSystemStatus);//working

driverRouter.post('/addAdmin', addAdmin);// deprecated service
driverRouter.post('/addDrivers', adminTokenValidator, addDriversController,);//frist driver
driverRouter.get('/all', adminTokenValidator, getDriversController,);//frist driver
// driverRouter.post('/completeOrder', driverTokenValidator, checkSystemStatusMiddleware, updateAssignedOrdersController);//working

// driverRouter.get('/getOrders/:phoneNo', adminTokenValidator, getOrdersController); // only assigned orders working
driverRouter.get('/allOrderNumber/', adminTokenValidator, getAllOrderNumberController); // only assigned orders working
driverRouter.get('/getOrderBulk/', adminTokenValidator, getOrdersBulkController); // only assigned orders working
driverRouter.get('/getOrderNormal/', adminTokenValidator, getOrdersNormalController); // only assigned orders working
driverRouter.get('/getOrderTotal/', adminTokenValidator, getAllOrdersController); // only assigned orders working
driverRouter.get('/getOrderComplete/', adminTokenValidator, getAllOrdersCompleteController); //desecnding order// only assigned orders working



driverRouter.post('/login', checkSystemStatusMiddleware, driverLoginController);//working
driverRouter.get('/getAllorders', driverTokenValidator, checkSystemStatusMiddleware, getAllOrdersController);// working
// multiple queries for completed order
// petrol only
// driverRouter.get('/getOnlyPetrol/:phoneNo', driverTokenValidator, getOnlyPetrolController)//working perfectly
// driverRouter.get('/getOnlyPetrol/:phoneNo', driverTokenValidator, getOnlyPetrolController)//working perfectly

module.exports = driverRouter