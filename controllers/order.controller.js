const express = require('express');
const orderValidator = require('../models/orderSchema.validator');
const Logger = require('../logger/logger');
const log = new Logger('Order_Controller');
const orderDao = require('../Dao/order.dao')
// const { UserModel } = require('../models/user.schemaModel')
const jwt = require('jsonwebtoken');

async function paymentBeforeOrderController(req, res) {

    const orderInfo = req.body;
    let { error } = orderValidator.validateAddOrderSchema(orderInfo, res);
    // console.log("check");
    if (isNotValidSchema(error, res)) return;
    // console.log("check2");
    try {

        const response = await orderDao.paymentBeforeOrderDao(req, res);
        return response;
        // res.status(200).send({ message: "Working" })
    } catch (error) {
        log.error(`Error in adding new order for phoneNO ${orderInfo.phoneNo}` + error)
        return res.status(400).send({
            message: 'error while adding order ' + error
        })
    }
}
async function addOrderController(req, res) {


    try {
        let { error } = orderValidator.validateAddOrderSchema(req.body, res);
        // console.log("check");
        if (isNotValidSchema(error, res)) return;
        if (req.body.order.paymentMethod != "COD") {
            return res.status(400).send({
                message: "Authentication Error",
                statusCode: 400
            })
        }
        else {

            console.log("check3");
            const token = req.header('x-auth-token');

            const response = await orderDao.addOrderDao(token, req.body);
            if (response == false) {
                log.error("error while ordering through cod")
                return res.status(400).send({
                    message: "Something Went Wrong",
                    statusCode: 400
                })
            }
            else {

                return res.status(200).send({ message: "Ordered successfully", result: response, statusCode: 200 })
            }
            // return response;
        }
    } catch (error) {
        log.error(`Error in adding new order for phoneNO ${req.body.phoneNo}` + error)
        return res.status(400).send({
            message: 'error while adding order ' + error
        })
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
    } catch (error) {
        log.error(`Error in try catch of order controller` + error);
    }
}

async function updateOrderStatusController(req, res) {
    const orderInfo = req.body;
    let { error } = orderValidator.validateUpdateOrderStatusSchema(orderInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        const response = await orderDao.updateOrderStatusDao(req, res);
        return response;
        // return res.status(200).send({
        // statusCode: 200,
        //     message: 'testing phase'
        // })
    } catch (error) {
        log.error(`Error in try catch of order controller` + error);
    }
}

async function getAllOrdersController(req, res) {
    console.log("controller checkpoint");

    try {
        console.log(" Dao entering checkpoint");
        const response = await orderDao.getAllOrdersDao(req, res);
        return response;
    } catch (error) {
        log.error(`Error in getting orders by the phone no ${orderInfo.phoneNo}` + error)
    }
}

async function getByIdController(req, res) {
    console.log("controller checkpoint");
    const orderInfo = req.body;
    console.log({ orderInfo });
    try {
        console.log(" Dao entering checkpoint");
        const response = await orderDao.getaddressByIdDao(req, res);
        return response;
    } catch (error) {
        log.error(`Error in getting orders by the phone no ${orderInfo}` + error)
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
    paymentBeforeOrderController,
    addOrderController,
    updateOrderDetailsController,
    updateOrderStatusController,
    getByIdController
};