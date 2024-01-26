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
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');

const orderRouter = express.Router();

// user
orderRouter.get('/getOrders/:phoneNo', authTokenValidator, checkSystemStatusMiddleware, getAllOrdersController,);//working checked
orderRouter.post('/addOrder', authTokenValidator, checkSystemStatusMiddleware, addOrderController);//working checked
// // getBy Id
// // orderRouter.get('/getOrderById/:_adrId', getByIdController)

// //admin
// orderRouter.post('/updateOrderDetails', adminTokenValidator, updateOrderDetailsController)//working checked

// // driver
orderRouter.post('/updateOrderStatus', driverTokenValidator, checkSystemStatusMiddleware, updateOrderStatusController)//working checked


module.exports = orderRouter;