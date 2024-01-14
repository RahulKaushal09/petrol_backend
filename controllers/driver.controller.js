const express = require('express');
const Logger = require('../logger/logger');
const log = new Logger('Order_Controller');
const driverValidator = require('../models/driver.validatorSchema');
const jwt = require('jsonwebtoken');


async function addDriversController(req, res) {
    console.log("abcc");
    const driverInfo = req.body;
    let { err } = driverValidator.validateAddDriversSchema(orderInfo, res);
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
    addDriversController
};