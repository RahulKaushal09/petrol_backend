const express = require('express');
const {
    addCoupanController,
    getAllCoupansController,
    editCoupanStatus
} = require('../controllers/coupan.controller');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');
const { authTokenValidator } = require('../middlewares/authTokenValidator.js');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus.js');


const coupanRouter = express.Router();

coupanRouter.get('/getCoupans', authTokenValidator, checkSystemStatusMiddleware, getAllCoupansController);//working
coupanRouter.get('/adminGetCoupans', adminTokenValidator, getAllCoupansController);//working
coupanRouter.post('/addCoupans', adminTokenValidator, addCoupanController);//working
coupanRouter.post('/editCoupanStatus', adminTokenValidator, editCoupanStatus);//working

module.exports = coupanRouter;