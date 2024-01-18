const express = require('express');
const {
    addCoupanController,
    getAllCoupansController
} = require('../controllers/coupan.controller');
const { adminTokenValidator } = require('../middlewares/adminTokenValidator.js');


const coupanRouter = express.Router();

coupanRouter.get('/getCoupans', getAllCoupansController);//working
coupanRouter.post('/addCoupans', adminTokenValidator, addCoupanController);//working

module.exports = coupanRouter;