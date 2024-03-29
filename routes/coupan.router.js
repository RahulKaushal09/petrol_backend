const express = require('express');
const {
    addCoupanController,
    getAllCoupansController,
    editCoupanStatus,
    getAllCoupansAdminController,
    findCoupanController
} = require('../controllers/coupan.controller');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');
const { authTokenValidator } = require('../middlewares/authTokenValidator.js');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');


const coupanRouter = express.Router();

coupanRouter.get('/getCoupons', authTokenValidator, checkSystemStatusMiddleware, getAllCoupansController);//working
coupanRouter.get('/getCouponsAdmin', adminTokenValidator, getAllCoupansAdminController);//working
coupanRouter.post('/applyCoupon', authTokenValidator, checkSystemStatusMiddleware, findCoupanController);//working
coupanRouter.post('/addCoupons', adminTokenValidator, addCoupanController);//working
coupanRouter.post('/editCouponStatus', adminTokenValidator, editCoupanStatus);//working

module.exports = coupanRouter;