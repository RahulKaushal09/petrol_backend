const Logger = require('../logger/logger');
const log = new Logger('Driver_Dao');
const { DriverModel, AdminModel, SystemStatusModel } = require('../models/driverSchema');
const { orderModel } = require('../models/order.schemaModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = "12345";

async function adminChangeSystemStatus(systemInfo, res) {
    const status = systemInfo.status;
    // console.log(status);
    const result = await SystemStatusModel.findOneAndUpdate({}, { $set: { "status": status } }, { upsert: true, new: true },

        async (err, response) => {
            if (err) {
                log.error(`error in updating the system status ->` + err);
                res.status(400).send({
                    statusCode: 400,
                    message: 'Error Happened!!'
                })
            }
            else {
                // console.log(response);
                return res.status(200).send({
                    statusCode: 200,
                    message: 'System status updated!!',
                    result: response
                })
            }
        })
    return result;
}
async function adminGetSystemStatusDao(req, res) {

    const result = await SystemStatusModel.findOne({},

        (err, response) => {
            if (err) {
                log.error(`error in updating the system status ->` + err);
                res.status(400).send({
                    statusCode: 400,
                    message: 'Error Happened!!'
                })
            }
            else {
                return res.status(200).send({
                    statusCode: 200,
                    message: 'System status updated!!',
                    result: response
                })
            }
        })
    return result;
}
async function adminLoginDao(driverInfo, res) {
    const username = driverInfo.username;
    const password = driverInfo.password;

    const result = await AdminModel.findOne({ username: username },
        async (err, response) => {
            if (err || !response) {
                log.error(`error in finding the username` + err);
                res.status(404).send({
                    message: 'error in logging in!'
                })
            }
            else {

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
                        "role": "admin"
                    },
                    secretKey,
                    // { expiresIn: "90d" }
                );
                return res.header('x-auth-token', jwtToken).status(200).send({
                    message: 'Logged In successfully!',
                    result: response
                })
            }
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
            if (err || !response || response == null) {

                const result = await DriverModel.findOne({ username: username },
                    async (err, response) => {
                        if (err || !response) {

                            log.error(`error in finding the username` + err);
                            return res.status(400).send({
                                statusCode: 400,
                                message: 'Error While Logging!!'
                            })
                        }
                        const isPasswordCorrect = await bcrypt.compare(password, response.password);
                        if (!isPasswordCorrect) {
                            log.info(`Incorrect password`);
                            return res.status(403).send({
                                statusCode: 403,
                                message: 'Incorrect password'
                            })
                        }
                        const jwtToken = jwt.sign(
                            {
                                "username": username,
                                "role": "driver"
                            },
                            secretKey,
                            // { expiresIn: "90d" }
                        );
                        // console.log(response);
                        return res.header('x-auth-token', jwtToken).status(200).send({
                            message: 'Logged In successfully!',
                            statusCode: 200,
                            role: "driver",
                            token: jwtToken,
                            result: response,

                        })
                    })
                return result;
            }
            else {
                const temp = await bcrypt.compare(password, response.password);
                if (!temp) {
                    return res.status(403).send({
                        statusCode: 403,
                        message: 'validation error with token'
                    })
                }
                else {
                    const jwtToken = jwt.sign(
                        {
                            "username": username,
                            "role": "admin"
                        },
                        secretKey,

                    );
                    return res.header('x-auth-token', jwtToken).status(200).send({
                        statusCode: 200,
                        token: jwtToken,
                        role: "admin",
                        message: 'Welcome Admin :)',
                        result: response
                    })
                }
            }
        })

}


async function updateDriverDao(req, res) {
    console.log("check 2");
    const _orderId = req._orderId;
    const username = req.username
    const payload = await orderModel.findOneAndUpdate(
        { _id: _orderId }, // Search condition
        { $set: { driver: username } }, // Update operation
        { new: true } // To return the updated document
        ,
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
                statusCode: 200,
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
                statusCode: 200,
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
                statusCode: 404,
                message: 'Error in fetching orders'
            })
        }
        let array = [];
        for (let i = 0; i < response.length; i++) {
            const orderArrSize = response[i].order.length;
            for (let j = 0; j < orderArrSize; j++) {
                // console.log(response[i].order[j].assignedTo, "aabb");
                array.push(response[i].order[j]);
            }
        }
        array.sort((a, b) => {
            const dateComparison = new Date(a.Date) - new Date(b.Date);
            if (dateComparison !== 0) {
                return dateComparison;
            }
            return a.preferredTiming.localeCompare(b.preferredTiming);
        });
        log.info(`successfully fetched orders for all drivers`);
        return res.status(200).send({
            statusCode: 200,
            message: '',
            result: array
        })
    })
    return result;
}

async function getAllOrdersCompleteDao(req, res) {
    const result = await orderModel.find({}, (err, response) => {
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
                    if (response[i].order[j].status == "completed") {
                        array.push(response[i].order[j]);
                    }
                }
            }
            array.sort((a, b) => {
                const dateComparison = new Date(b.Date) - new Date(a.Date); // Reverse comparison for descending order
                if (dateComparison !== 0) {
                    return dateComparison;
                }
                return b.preferredTiming.localeCompare(a.preferredTiming); // Reverse comparison for descending order
            });
            console.log(array);
            log.info(`successfully fetched Complete Orders`);
            return res.status(200).send({
                statusCode: 200,
                message: 'Successfully fetched all orders',
                result: array
            })
        }
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
                statusCode: 200,
                message: 'Successfully fetched all orders',
                result: array
            })
        }
    })
    return result;
}
async function getordersNormalDao(req, res) {
    const result = await orderModel.find({}, (err, response) => {
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
                    if (parseInt(response[i].order[j].fuelAmount) < 500 && response[i].order[j].status == "pending") {
                        array.push(response[i].order[j]);
                    }
                }
            }
            array.sort((a, b) => {
                const dateComparison = new Date(a.Date) - new Date(b.Date);
                if (dateComparison !== 0) {
                    return dateComparison;
                }
                return a.preferredTiming.localeCompare(b.preferredTiming);
            });
            console.log(array);
            log.info(`successfully fetched Normal Orders`);
            return res.status(200).send({
                statusCode: 200,
                message: '',
                result: array
            })
        }
    })
    return result;
}
async function getordersBulkDao(req, res) {
    const result = await orderModel.find({}, (err, response) => {
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
                    if (parseInt(response[i].order[j].fuelAmount) >= 500) {
                        array.push(response[i].order[j]);
                    }
                }
            }
            array.sort((a, b) => {
                const dateComparison = new Date(a.Date) - new Date(b.Date);
                if (dateComparison !== 0) {
                    return dateComparison;
                }
                return a.preferredTiming.localeCompare(b.preferredTiming);
            });
            console.log(array);
            log.info(`successfully fetched orders for the bulk order`);
            return res.status(200).send({
                statusCode: 200,
                message: '',
                result: array
            })
        }
    })
    return result;
}
async function getAllOrderNumberDoa(req, res) {
    const result = await orderModel.find({}, (err, response) => {
        if (err || !response) {
            log.error(`error in the querry of get orders dao` + err);
            return res.status(400).send({
                statusCode: 400,
                message: 'error in fetching orders'
            })
        }
        else {
            let bulk = 0;
            let normal = 0;
            let complete = 0;
            let total = 0;

            console.log({ response });
            for (let i = 0; i < response.length; i++) {
                const orderArrSize = response[i].order.length;
                total += orderArrSize
                for (let j = 0; j < orderArrSize; j++) {
                    // console.log(response[i].order[j].assignedTo, "aabb");
                    if (parseInt(response[i].order[j].fuelAmount) >= 500) {
                        bulk += 1;
                    }
                    if (parseInt(response[i].order[j].fuelAmount) < 500 && response[i].order[j].status == "pending") {
                        normal += 1;
                    }
                    if (response[i].order[j].status == "completed") {
                        complete += 1;
                    }
                }
            }
            log.info(`All numbers of orders Succesfully collected`);
            return res.status(200).send({
                statusCode: 200,
                message: '',
                result: {
                    bulkOrders: bulk,
                    normalOrders: normal,
                    completeOrders: complete,
                    totalOrders: total,
                },

            })
        }
    })
    return result;
}


async function addAdminDao(adminInfo, res) {
    try {

        console.log({ adminInfo });
        const username = adminInfo.username;
        const password = adminInfo.password;
        const name = adminInfo.name;

        let newAdmin = new AdminModel({
            name: name,
            username: username,
            password: password,
            phoneNo: '1234567890',
        })
        newAdmin.password = await bcrypt.hash(password, 12);
        await newAdmin.save((err, response) => {
            if (err || !response) {
                return res.status(400).send('error in adding Admin');
            }
            else {

                return res.status(200).send('Admin Created')
            }
        })
    } catch (error) {
        log.error('error while adding admin')
        return res.status(400).send({
            message: 'error while adding admin' + error,
        })
    }
}

async function addDriversDao(driverInfo, res) {
    try {

        console.log({ driverInfo }, " dao layer entered");
        // const phoneNo = driverInfo.phoneNo;

        await DriverModel.findOne({}, async (err, response) => {
            if (err || !response) {
                log.error("error while adding new driver!!!")
                return res.status(400).send('Something Went Wrong');
            }
            else {
                let newDriver = new DriverModel({
                    name: driverInfo.name,
                    username: driverInfo.username,
                    password: driverInfo.password,
                    phoneNo: driverInfo.phoneNo,
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
                        return res.status(200).send({
                            statusCode: 200,
                            message: 'New Driver Created'
                        })
                    })
                    return result;
                }
                registerNewUser();
                // return res.status(400).send({
                //     statusCode: 400,
                //     message: 'Driver already exists',
                //     result: response
                // })
            }
        })
    } catch (error) {
        log.error('error while adding new driver ' + error)
        return res.status(400).send({
            statusCode: 400,
            message: 'error while adding new driver',
        })
    }
}
async function getDriversDao(req, res) {
    try {

        console.log("all driver dao layer entered");

        await DriverModel.find({}, async (err, response) => {
            if (err || !response) {
                log.error(`error in the querry of get all driver dao` + err);
                return res.status(404).send({
                    message: 'Cant Find Drivers'
                })
            }
            else {
                log.info(`successfully fetched all driver`);
                return res.status(200).send({
                    statusCode: 200,
                    message: '',
                    result: response
                })
            }

        })
    } catch (error) {
        log.error('error while adding new driver ' + error)
        return res.status(400).send({
            statusCode: 400,
            message: 'error while adding new driver',
        })
    }
}

module.exports = {
    addDriversDao,
    driverLoginDao,
    getordersDao,
    getAllOrdersDao,
    getAllOrderNumberDoa,
    adminLoginDao,
    updateDriverDao,
    getPetrolDao,
    getordersNormalDao,
    getAllOrdersCompleteDao,
    adminChangeSystemStatus,
    getordersBulkDao,
    adminGetSystemStatusDao,
    getDriversDao,
    addAdminDao
}