const express = require('express');
const {
    getAllOrdersController,
    addOrderController,
    updateOrderDetailsController,
    updateOrderStatusController,
    paymentBeforeOrderController,
    getByIdController
} = require('../controllers/order.controller.js');
const { authTokenValidator } = require('../middlewares/authTokenValidator');
const { driverTokenValidator } = require('../middlewares/driverTokenValidator.js');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');
const webhookHandler = require('../webhooks/webhookHandler.js');
const Logger = require('../logger/logger');
const log = new Logger('Order_Controller');

const orderRouter = express.Router();

// user
orderRouter.get('/getOrders/', authTokenValidator, checkSystemStatusMiddleware, getAllOrdersController,);//working checked
orderRouter.post('/addOrder/onlinePayment', authTokenValidator, checkSystemStatusMiddleware, paymentBeforeOrderController);//working checked
orderRouter.post('/addOrder/cod', authTokenValidator, checkSystemStatusMiddleware, addOrderController);//working checked
// // getBy Id
// // orderRouter.get('/getOrderById/:_adrId', getByIdController)

// webhook after payment done
orderRouter.post('/webhook', (request, response) => {
    try {
        log.info("handling webhooks")

        webhookHandler.handleWebhookEvent(request, response);
    } catch (error) {
        log.error("error while handling webhook")
        response.status(500).send({

            message: "Something Went Wrong"
        })
    }
});
// //admin
// orderRouter.post('/updateOrderDetails', adminTokenValidator, updateOrderDetailsController)//working checked

// // driver
orderRouter.post('/updateOrderStatus', driverTokenValidator, checkSystemStatusMiddleware, updateOrderStatusController)//working checked


module.exports = orderRouter;