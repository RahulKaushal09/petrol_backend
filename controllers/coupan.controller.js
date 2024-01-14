const CoupanValidator = require('../models/coupan.schema.validator');
const Logger = require('../logger/logger');
const log = new Logger('Order_Controller');
const coupanDao = require('../Dao/coupan.dao')

async function addCoupanController(req, res) {
    console.log("check");
    const coupanInfo = req.body;
    let { err } = CoupanValidator.validateAddCoupanSchema(coupanInfo, res);
    console.log("check");
    if (isNotValidSchema(err, res)) return;
    console.log("check2");
    try {
        console.log("check3");
        const response = await coupanDao.addCoupanDao(coupanInfo, res);
        return response;
        // res.status(200).send({ message: "Working" })
    } catch (error) {
        log.error(`Error in adding new coupan ${coupanInfo}` + error)
        return res.status(500).send({
            message: `Error in adding new Coupan ` + error
        })
    }
}

async function getAllCoupansController(req, res) {
    log.info('controller entered');
    const coupanInfo = req.params;
    let { err } = CoupanValidator.validateGetAllCoupansSchema(coupanInfo, res);
    if (isNotValidSchema(err, res)) return;

    try {
        const result = await coupanDao.getAllCoupansDao(coupanInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in Dao trycatch layer ` + error)
    }
}
// async function getAllOrdersController(req, res) {
//     console.log("controller checkpoint");
//     const loginInfo = req.params;
//     console.log({ loginInfo });
//     let { error } = orderValidator.validateGetOrdersSchema(loginInfo, res);
//     if (isNotValidSchema(error, res)) return;
//     try {
//         console.log(" Dao entering checkpoint");
//         const response = await orderDao.getAllOrdersDao(loginInfo, res);
//         return response;
//     } catch (error) {
//         log.error(`Error in getting orders by the phone no ${loginInfo.phoneNo}` + error)
//     }
// }

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
    addCoupanController,
    getAllCoupansController
};