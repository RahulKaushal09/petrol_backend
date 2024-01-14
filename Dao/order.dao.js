const Logger = require('../logger/logger');
const log = new Logger('User_Dao');
const { orderModel } = require('../models/order.schemaModel')
const { UserModel } = require('../models/user.schemaModel')

const secretKey = "12345"

async function getAllOrdersDao(loginInfo, res) {
    const phoneNo = loginInfo.phoneNo;
    console.log({ phoneNo });
    await orderModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log("checkpoint3");
        if (err || !response) {
            log.error(`Error in finding phoneNo ${phoneNo}` + err);
            return res.status(404).send({
                phoneNo: phoneNo,
                message: 'No order with this' + phoneNo + 'found'
            })
        }
        log.info(`Found a order with phone No ${phoneNo}`);
        return res.status(200).send({
            result: response,
            message: `Found a order with phoneno ${phoneNo}`
        })
    })
}

async function updateOrderDetailsDao(orderInfo, res) {
    const phoneNo = orderInfo.phoneNo;
    const orderID = orderInfo.orderID;
    const status = orderInfo.status;
    const assignedTo = orderInfo.assignedTo;
    const assignTiming = orderInfo.assignTiming;
    console.log({ phoneNo }, { status }, { assignedTo }, { assignTiming });
    // {
    //     status: "pending"
    //     assignedTo: "Null"
    //     assignTiming: "null"
    // }
    const result = await orderModel.findOneAndUpdate(
        {
            phoneNo: phoneNo,
            "order._id": orderID
        },
        {
            $set: {
                "order.$.status": status,
                "order.$.assignedTo": assignedTo,
                "order.$.assignTiming": assignTiming
            }
        },
        { new: true, upsert: true },
        (err, response) => {
            if (err || !response) {
                log.error(`Error in dao querry` + err);
                return res.status(500).send({
                    message: 'Error in updating order details'
                })
            }
            console.log(response.order[1]);
            log.info(`Successfully updated order Details `);
            return res.status(200).send({
                message: 'Successfully updated order details'
            })
        })
    return result;
}

async function phoneExists(orderInfo) {
    return await UserModel.findOne({ phoneNo: orderInfo.phoneNo });
}

async function addOrderDao(orderInfo, res) {
    console.log({ orderInfo });
    const payload = await phoneExists(orderInfo);
    if (!payload) {
        return res.status(404).send({
            message: 'Cant find the user with phoneNo' + orderInfo.phoneNo
        })
    }

    const reqAdr = orderInfo.order.addressId;
    const Order = orderInfo.order;
    let {
        _id,
        name,
        phoneNo,
        myself,
        saveas,
        fulladdr,
        vehicle,
        vnumber,
    } = "";
    let flag = false;
    function searchAdrId() {
        payload.address.map((index) => {
            // console.log(index);
            console.log(index._id, "dbId ", reqAdr);
            if (index._id == reqAdr) {
                _id = index._id;
                name = index.name;
                phoneNo = index.phoneNo;
                myself = index.myself;
                saveas = index.saveas;
                fulladdr = index.fulladdr;
                vehicle = index.vehicle;
                vnumber = index.vnumber;
                console.log("112233");
                flag = true;
            }
        })
    }
    console.log("map check");
    searchAdrId();
    if (flag === false) {
        log.error(`Cannot find a address this account`);
        return res.status(404).send({
            message: 'Please add a address first to make an order'
        })
    }
    let orderDetails = await orderModel.findOne({ phoneNo: orderInfo.phoneNo });
    console.log({ orderDetails });
    let index = 0;
    console.log({ index });
    if (orderDetails) {
        index = orderDetails.order.length;
    }
    if (index === 0) {
        let newOrder = new orderModel({
            "phoneNo": orderInfo.phoneNo,
            "order": {
                "fuelType": orderInfo.order.fuelType,
                "fuelAmount": orderInfo.order.fuelAmount,
                "emergency": orderInfo.order.emergency,
                "Date": orderInfo.order.Date,
                "preferredTiming": orderInfo.order.preferredTiming,
                "CoupanId": orderInfo.order.CoupanId,
                "addressId": orderInfo.order.addressId,
                "status": orderInfo.order.status,
                "assignedTo": orderInfo.order.assignedTo,
                "assignTiming": orderInfo.order.assignTiming
            }
        });
        const result = await newOrder.save((err, result) => {
            if (err) {
                log.error(`Error in adding first order for phoneNo ${orderInfo.phoneNo}: ` + err);
                return res.status(500).send({
                    message: 'phoneNo ' + orderInfo.phoneNo + ' Error in saving first order.'
                });
            };
            log.info(result.phoneNo + ' has just ordered for the first time!');
            return res.status(200).send({
                message: 'Your first order is queued successfully.',
                phoneNo: result.phoneNo
            });
        });
        console.log("11");
        return result;
    }
    const check = orderDetails.order;
    check.push(Order)
    console.log({ check });
    // const response = await orderModel.findOneAndUpdate({ phoneNo: orderInfo.phoneNo }, { order: check })
    const result = await orderModel.findOneAndUpdate({ phoneNo: phoneNo }, { order: check }, { new: true, upsert: true }, (err, response) => {
        console.log("updatePoint");
        if (err || !response) {
            console.log(response);
            log.error(`Error in adding new order` + err);
            return res.status(400).send({
                message: 'Error in adding new order'
            })
        }
        log.info(`Sucessfully added new order in the order array to phoneNo ${phoneNo}`);
        // console.log(res);
        return res.status(200).send({
            message: 'Successfully added new order',
        })
    })
    return result;


    // console.log({ payload });
    // res.status(200).send({
    //     message: 'Testing phase'
    // })
}

module.exports = {
    getAllOrdersDao,
    addOrderDao,
    updateOrderDetailsDao
}