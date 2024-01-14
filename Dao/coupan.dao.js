const Logger = require('../logger/logger');
const log = new Logger('Coupan_Dao');
// const { orderModel } = require('../models/order.schemaModel')
// const { UserModel } = require('../models/user.schemaModel')
const { CoupanModel } = require('../models/coupan.schemaModel');

const secretKey = "12345"

// async function getAllOrdersDao(loginInfo, res) {
//     const phoneNo = loginInfo.phoneNo;
//     console.log({ phoneNo });
//     await orderModel.findOne({ phoneNo: phoneNo }, (err, response) => {
//         console.log("checkpoint3");
//         if (err || !response) {
//             log.error(`Error in finding phoneNo ${phoneNo}` + err);
//             return res.status(404).send({
//                 phoneNo: phoneNo,
//                 message: 'No order with this' + phoneNo + 'found'
//             })
//         }
//         log.info(`Found a order with phone No ${phoneNo}`);
//         return res.status(200).send({
//             result: response,
//             message: `Found a order with phoneno ${phoneNo}`
//         })
//     })
// }
// async function phoneExists(orderInfo) {
//     return await UserModel.findOne({ phoneNo: orderInfo.phoneNo });
// }

// async function getFunction(phoneNo) {
//     console.log({ phoneNo });
//     return await CoupanModel.findOne({ phoneNo: phoneNo });
// }

async function getAllCoupansDao(coupanInfo, res) {
    log.success('dao layer entered');
    console.log({ coupanInfo });
    const phoneNo = coupanInfo.phoneNo;
    // const response = await getFunction(phoneNo);
    // console.log({ response });
    return await CoupanModel.find({ phoneNo: phoneNo }, (err, response) => {
        log.success('dao querry layer entered');
        if (err || !response) {
            log.error(`failed in the query in dao layer ` + err);
            return res.status(404).send({
                message: 'Cannot find any coupans with given phoneNo ' + phoneNo
            })
        }
        console.log({ response });
        log.success('Successfully fetched all the coupans with given phoen no');
        res.status(200).send({
            message: 'Successfully fetched all the coupans',
            result: response
        })
    })
}

async function addCoupanDao(coupanInfo, res) {
    console.log({ coupanInfo });
    let newCoupan = new CoupanModel({
        "name": coupanInfo.name,
        "phoneNo": coupanInfo.phoneNo,
        "code": coupanInfo.code,
        "discount": coupanInfo.discount,
        "validTill": coupanInfo.validTill,
        "limit": coupanInfo.limit
    });

    const result = await newCoupan.save((err, response) => {
        console.log("save querry entered");
        if (err || !response) {
            log.error(`Error in adding new coupan ` + err);
            return res.status(500).send({
                message: 'error in adding new coupana'
            })
        }
        log.blink('New coupan has been added to the db');
        return res.status(200).send({
            message: 'New Coupan has successfully added'
        })
    })
    return result;
    // console.log({ payload });
    // res.status(200).send({
    //     message: 'Testing phase'
    // })
}

module.exports = {
    addCoupanDao,
    getAllCoupansDao
}