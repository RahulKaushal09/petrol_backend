const Logger = require('../logger/logger');
const log = new Logger('Driver_Dao');
const { DriverModel, AdminModel } = require('../models/driverSchema');
const { orderModel } = require('../models/order.schemaModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = "12345";

async function adminLoginDao(driverInfo, res) {
    const username = driverInfo.username;
    const password = driverInfo.password;

    const result = await DriverModel.findOne({ username: username },
        async (err, response) => {
            if (err || !response) {
                log.error(`error in finding the username` + err);
                res.status(404).send({
                    message: 'error in logging in!'
                })
            }
            const isPasswordCorrect = await bcrypt.compare(password, response.password);
            if (!isPasswordCorrect) {
                log.info(`Incorrect password`);
                return res.status(400).send({
                    message: 'incorrect password'
                })
            }
            const jwtToken = jwt.sign(
                {
                    "username": username,
                    "password": password
                },
                secretKey,
                // { expiresIn: "90d" }
            );
            return res.header('x-auth-token', jwtToken).status(200).send({
                message: 'Logged In successfully!',
                result: response
            })
        })
    return result;
}

async function driverLoginDao(driverInfo, res) {
    console.log({ driverInfo });
    const username = driverInfo.username;
    const password = driverInfo.password;

    let flag = false;
    await AdminModel.findOne({ username: username },
        async (err, response) => {
            console.log("point");
            console.log({ response });
            if (err || !response) {
                flag = true;
            }
            const temp = await bcrypt.compare(password, response.password);
            if (!temp) {
                return res.status(403).send({
                    message: 'validation error with token'
                })
            }
            else {
                const jwtToken = jwt.sign(
                    {
                        "username": username,
                        "password": password
                    },
                    secretKey,
                    // { expiresIn: "90d" }
                );
                return res.header('x-auth-token', jwtToken).status(200).send({
                    message: 'Logged In as admin successfully!',
                    result: response
                })
            }
        })
    if (flag) {
        const result = await DriverModel.findOne({ username: username },
            async (err, response) => {
                if (err || !response) {
                    log.error(`error in finding the username` + err);
                    res.status(404).send({
                        message: 'error in logging in!'
                    })
                }
                const isPasswordCorrect = await bcrypt.compare(password, response.password);
                if (!isPasswordCorrect) {
                    log.info(`Incorrect password`);
                    return res.status(400).send({
                        message: 'incorrect password'
                    })
                }
                const jwtToken = jwt.sign(
                    {
                        "username": username,
                        "password": password
                    },
                    secretKey,
                    // { expiresIn: "90d" }
                );
                return res.header('x-auth-token', jwtToken).status(200).send({
                    message: 'Logged In as driver successfully!',
                    result: response
                })
            })
        return result;
    }
}


async function updateDriverDao(driverInfo, res) {
    console.log("check 2");
    const phoneNo = driverInfo.phoneNo;
    const _orderId = driverInfo._orderId;
    const payload = await DriverModel.findOne({ phoneNo: phoneNo },
        async (err, response) => {
            if (err || !response) {
                log.error(`Cannot find a driver with this phoneNo` + err);
                return res.status(404).send({
                    message: 'Can not find a driver with this phoneNo'
                })
            }
            // when we found array of assigned orders
            // for(then get the details of that order)
            // use another nested loop to check
            // if(abs(response.assignedOrder[j].prefferedTime-response.assignedOrder[i]))
            // is less 1 hour according to ISO date format then dont add for that time
            // let count = 0;
            // for (let i = 0; i < response.assignedOrders.length; i++) {
            //     const adrId = response.assignedOrders[i]._orderId;

            // }
        })
    console.log({ payload });
    // const adrArray = payload.address;
    const temp = {
        _orderId: _orderId
    }
    payload.assignedOrders.push(temp);
    // console.log(payload);
    const array = payload.assignedOrders;
    console.log({ array });
    const result = await DriverModel.findOneAndUpdate(
        { phoneNo: phoneNo },
        { assignedOrders: payload.assignedOrders },
        (err, response) => {
            console.log("updatePoint");
            if (err || !response) {
                log.error(`Error in adding new order to a driver` + err);
                return res.status(400).send({
                    message: 'Error in adding new order to a driver'
                })
            }
            log.info(`Sucessfully added new order to phoneNo ${phoneNo}`);
            // console.log(res);
            return res.status(200).send({
                message: 'Successfully added new order',
            })
        })
    return result;
}

async function getPetrolDao(driverInfo, res) {
    const phoneNo = driverInfo;
    const result = await orderModel.find({ 'order.assignedTo': phoneNo }, (err, response) => {
        if (err || !response) {
            log.error(`error in the querry of get orders dao` + err);
            return res.status(404).send({
                message: 'error in fetching orders'
            })
        }
        else {
            console.log({ response });
            let array = [];
            for (let i = 0; i < response.length; i++) {
                const orderArrSize = response[i].order.length;
                for (let j = 0; j < orderArrSize; j++) {
                    // console.log(response[i].order[j].assignedTo, "aabb");
                    if (response[i].order[j].assignedTo == phoneNo && response[i].order[j].fuelType == 'petrol') {
                        array.push(response[i].order[j]);
                    }
                }
            }
            console.log(array);
            log.info(`successfully fetched orders for the driver with phoneNO ${phoneNo}`);
            return res.status(200).send({
                message: 'Successfully fetched all orders',
                result: array
            })
        }
    })
    return result;
}

async function getAllOrdersDao(driverInfo, res) {
    const result = await orderModel.find({}, (err, response) => {
        if (err || !response) {
            log.error(`error in the querry of get orders dao` + err);
            return res.status(404).send({
                message: 'error in fetching orders'
            })
        }
        log.info(`successfully fetched orders for all drivers`);
        return res.status(200).send({
            message: 'Successfully fetched all orders',
            result: response
        })
    })
    return result;
}

async function getordersDao(driverInfo, res) {
    const phoneNo = driverInfo;
    const result = await orderModel.find({ 'order.assignedTo': phoneNo }, (err, response) => {
        if (err || !response) {
            log.error(`error in the querry of get orders dao` + err);
            return res.status(404).send({
                message: 'error in fetching orders'
            })
        }
        else {
            console.log({ response });
            let array = [];
            for (let i = 0; i < response.length; i++) {
                const orderArrSize = response[i].order.length;
                for (let j = 0; j < orderArrSize; j++) {
                    // console.log(response[i].order[j].assignedTo, "aabb");
                    if (response[i].order[j].assignedTo == phoneNo) {
                        array.push(response[i].order[j]);
                    }
                }
            }
            console.log(array);
            log.info(`successfully fetched orders for the driver with phoneNO ${phoneNo}`);
            return res.status(200).send({
                message: 'Successfully fetched all orders',
                result: array
            })
        }
    })
    return result;
}


async function addAdminDao(driverInfo, res) {
    console.log({ driverInfo });
    const username = driverInfo.username;
    const password = driverInfo.password;
    const name = driverInfo.name;

    let newAdmin = new AdminModel({
        name: name,
        username: username,
        password: password,
        phoneNo: '1234567890',
        role: 'ADMIN'
    })
    newAdmin.password = await bcrypt.hash(password, 12);
    await newAdmin.save((err, response) => {
        if (err || !response) {
            return res.status(400).send('error in adding Admin');
        }
        return res.status(200).send('Admin Created')
    })
}

async function addDriversDao(driverInfo, res) {

    console.log({ driverInfo }, " dao layer entered");
    const phoneNo = driverInfo.phoneNo;

    await DriverModel.findOne({ phoneNo: phoneNo }, async (err, response) => {
        if (err || !response) {
            let newDriver = new DriverModel({
                name: driverInfo.name,
                username: driverInfo.username,
                password: driverInfo.password,
                phoneNo: phoneNo,
                // assignedOrders: [{ _orderId: driverInfo.assignedOrders._orderId, }],
            })
            newDriver.password = await bcrypt.hash(driverInfo.password, 12);
            console.log({ newDriver });
            async function registerNewUser() {
                const result = await newDriver.save((err, response) => {
                    if (err || !response) {
                        log.error(`Error in saving mongoose querry` + err);
                        return res.status(500).send({
                            message: 'error in saving driver info in db'
                        })
                    }
                    log.info(`Successfully saved the driver info in the db`);
                    return res.send({
                        message: 'Successfully saved the data in db'
                    })
                })
                return result;
            }
            registerNewUser();
        }
        else {
            return res.status(409).send({
                message: 'driver already exists with this phoneNo',
                result: response
            })
        }
    })
}

module.exports = {
    addDriversDao,
    driverLoginDao,
    getordersDao,
    getAllOrdersDao,
    adminLoginDao,
    updateDriverDao,
    getPetrolDao,
    addAdminDao
}