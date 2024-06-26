const Logger = require('../logger/logger');
const log = new Logger('Driver_Controller');
const driverValidator = require('../models/driver.validatorSchema');
const driverDao = require('../Dao/driver.dao')
// const nodemailer = require("nodemailer");
require('dotenv').config();
// const jwt = require('jsonwebtoken');

async function adminGetSystemStatus(req, res) {


    try {
        const result = await driverDao.adminGetSystemStatusDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in loggin in the driver`);
    }
}
async function adminSystemStatus(req, res) {
    const systemInfo = req.body;
    let { error } = driverValidator.validateSystemStatus(systemInfo, res);
    // console.log("check");
    if (isNotValidSchema(error, res)) return;

    try {
        const result = await driverDao.adminChangeSystemStatus(systemInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in loggin in the driver`);
    }
}
async function adminLoginController(req, res) {
    const adminInfo = req.body;
    let { error } = driverValidator.validateLoginAdminSchema(adminInfo, res);
    // console.log("check");
    if (isNotValidSchema(error, res)) return;

    try {
        const result = await driverDao.adminLoginDao(adminInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in loggin in the driver`);
    }
}

async function driverLoginController(req, res) {
    const driverInfo = req.body;
    let { error } = driverValidator.validateLoginDriverSchema(driverInfo, res);
    // console.log("check");
    if (isNotValidSchema(error, res)) return;

    try {
        const result = await driverDao.driverLoginDao(driverInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in logging in the driver`);
        res.status(400).send({
            message: "Something Went Wrong!!"
        })
    }
}

async function getAllOrdersController(req, res) {
    // const driverInfo = req.params.phoneNo;
    try {
        const result = await driverDao.getAllOrdersDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in the controller of getall orders`)
    }
}
async function getAllOrdersCompleteController(req, res) {
    // const driverInfo = req.params.phoneNo;
    try {
        const result = await driverDao.getAllOrdersCompleteDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in the controller of getall orders`)
    }
}

async function getOnlyPetrolController(req, res) {
    const driverInfo = req.params.phoneNo;
    console.log("flagger");
    try {
        const result = await driverDao.getPetrolDao(driverInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in the getorderscontroller`);
    }
}

async function getOrdersController(req, res) {
    // console.log(req);
    const driverInfo = req.params.phoneNo;
    console.log("flagger");
    try {
        const result = await driverDao.getordersDao(driverInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in the getorderscontroller`);
    }
}
async function getOrdersBulkController(req, res) {
    // console.log(req);
    console.log("flagger");
    try {
        const result = await driverDao.getordersBulkDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in the getorderscontroller`);
    }
}
async function getAllOrderNumberController(req, res) {
    // console.log(req);
    console.log("flagger");
    try {
        const result = await driverDao.getAllOrderNumberDoa(req, res);
        return result;
    } catch (error) {
        log.error(`Error in the getorderscontroller`);
    }
}
async function getOrdersNormalController(req, res) {
    // console.log(req);
    console.log("flagger");
    try {
        const result = await driverDao.getordersNormalDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in the getorderscontroller`);
    }
}

async function addDriversController(req, res) {
    console.log("abcc");
    const driverInfo = req.body;
    console.log({ driverInfo });
    let { error } = driverValidator.validateAddDriversSchema(driverInfo, res);
    console.log("check");
    if (isNotValidSchema(error, res)) return;
    // console.log("check2");
    try {
        console.log("check3");
        const response = await driverDao.addDriversDao(driverInfo, res);
        return response;
    } catch (error) {
        log.error(`Error in adding new order for phoneNO ${driverInfo.phoneNo}` + error)
    }
    // return res.send("testing")
}
async function getDriversController(req, res) {

    console.log("check");
    // console.log("check2");
    try {
        console.log("check3");
        const response = await driverDao.getDriversDao(req, res);
        return response;
    } catch (error) {
        log.error(`Error in adding new order for phoneNO ${driverInfo.phoneNo}` + error)
    }
    // return res.send("testing")
}

async function updateAssignedOrdersController(req, res) {
    let { error } = driverValidator.validateUpdateDriverOrderSchema(req, res);

    if (isNotValidSchema(error, res)) return;
    try {
        console.log("checkpoint 1");
        const result = await driverDao.updateDriverDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in adding new order ` + error)
    }
}

async function addAdmin(req, res) {
    const adminInfo = {
        name: 'Admin',
        username: 'admin',
        password: 'admin'
    };
    // const driverInfo=req.body;
    const result = await driverDao.addAdminDao(adminInfo, res);
    return result;
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
    addDriversController,
    driverLoginController,
    getOrdersController,
    getAllOrdersController,
    adminLoginController,
    updateAssignedOrdersController,
    getOnlyPetrolController,
    adminSystemStatus,
    getDriversController,
    adminGetSystemStatus,
    getOrdersBulkController,
    getOrdersNormalController,
    getAllOrderNumberController,
    getAllOrdersCompleteController,
    addAdmin
};