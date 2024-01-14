const express = require('express');
const orderValidator = require('../models/orderSchema.validator');
const Logger = require('../logger/logger');
const log = new Logger('Order_Controller');
const orderDao = require('../Dao/order.dao')
// const { UserModel } = require('../models/user.schemaModel')
const jwt = require('jsonwebtoken');


async function addOrderController(req, res) {
    console.log("abcc");
    const orderInfo = req.body;
    let { err } = orderValidator.validateAddOrderSchema(orderInfo, res);
    // console.log("check");
    if (isNotValidSchema(err, res)) return;
    // console.log("check2");
    try {
        // console.log("check3");
        const response = await orderDao.addOrderDao(orderInfo, res);
        return response;
        // res.status(200).send({ message: "Working" })
    } catch (error) {
        log.error(`Error in adding new order for phoneNO ${orderInfo.phoneNo}` + error)
    }
}

async function updateOrderDetailsController(req, res) {
    const orderInfo = req.body;
    console.log({ orderInfo }, "controller entered");
    let { error } = orderValidator.validateUpdateOrderSchema(orderInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        const response = await orderDao.updateOrderDetailsDao(orderInfo, res);
        return response;
        // return res.status(200).send({
        //     message: 'testing phase'
        // })
    } catch (error) {
        log.error(`Error in try catch of order controller` + error);
        return res.status(400).send({
            message: 'Error in updating order information'
        })
    }
}

async function getAllOrdersController(req, res) {
    console.log("controller checkpoint");
    const loginInfo = req.params;
    console.log({ loginInfo });
    let { error } = orderValidator.validateGetOrdersSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        console.log(" Dao entering checkpoint");
        const response = await orderDao.getAllOrdersDao(loginInfo, res);
        return response;
    } catch (error) {
        log.error(`Error in getting orders by the phone no ${loginInfo.phoneNo}` + error)
    }
}

function isNotValidSchema(error, res) {
    if (error) {
        log.error(`Schema validation error:${error.details[0].message}`);
        res.status(400).send({
            message: error.details[0].message
        });
        return true;
    }
    return false;
}

module.exports = {
    getAllOrdersController,
    addOrderController,
    updateOrderDetailsController
};