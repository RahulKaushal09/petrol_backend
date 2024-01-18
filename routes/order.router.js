const express = require('express');
const {
    getAllOrdersController,
    addOrderController,
    updateOrderDetailsController,
    updateOrderStatusController,
    getByIdController
} = require('../controllers/order.controller.js');
const { authTokenValidator } = require('../middlewares/authTokenValidator');
const { driverTokenValidator } = require('../middlewares/driverTokenValidator.js');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');

const orderRouter = express.Router();

// user
orderRouter.get('/getOrders/:phoneNo', authTokenValidator, getAllOrdersController,);//working checked
orderRouter.post('/addOrder', addOrderController);//working checked
// getBy Id
// orderRouter.get('/getOrderById/:_adrId', getByIdController)

//admin
orderRouter.post('/updateOrderDetails', adminTokenValidator, updateOrderDetailsController)//working checked

// driver
orderRouter.post('/updateOrderStatus', driverTokenValidator, updateOrderStatusController)//working checked


module.exports = orderRouter;