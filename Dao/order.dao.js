const Logger = require('../logger/logger');
const log = new Logger('User_Dao');
const { orderModel } = require('../models/order.schemaModel')
const { UserModel } = require('../models/user.schemaModel');
const { ScheduleModel } = require('../models/order.schemaModel');
const { CoupanModel } = require('../models/coupan.schemaModel');
const { errorMonitor } = require('nodemailer/lib/xoauth2');
const { FuelModel } = require('../models/fuel.schemaModel');
require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken')
const secretKey = "123456789"

async function getAllOrdersDao(req, res) {
    const phoneNo = req.phoneNo;
    console.log({ phoneNo });
    await orderModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log("checkpoint3");
        if (err) {
            log.error(`Error in finding phoneNo ${phoneNo}` + err);
            return res.status(404).send({
                phoneNo: phoneNo,
                // message: 'error in finding phone No ' + phoneNo
            })
        }
        else if (!response) {

            log.error(`no response in phoneNo ${phoneNo}`);
            return res.status(200).send({
                statusCode: 200,
                phoneNo: phoneNo,
                result: { order: [] }
                // message: 'No order with this ' + phoneNo + ' number found'
            })
        }
        else {
            let array = response.order;
            array.sort((a, b) => {
                const dateA = new Date(a.Date);
                const dateB = new Date(b.Date);

                // Check for emergencies
                const emergencyA = a.emergency || false;
                const emergencyB = b.emergency || false;

                // If either is an emergency, prioritize it regardless of date
                if (emergencyA && !emergencyB) {
                    return -1; // Emergency A comes first
                } else if (!emergencyA && emergencyB) {
                    return 1; // Emergency B comes first
                } else {
                    // If both are emergencies, maintain the original order
                    if (emergencyA && emergencyB) {
                        return 0;
                    }

                    // If not emergencies and both don't have preferred timings, maintain the original order
                    if ((!a.preferredTiming || !b.preferredTiming) && !emergencyA && !emergencyB) {
                        return 0;
                    }

                    // If only one case has a preferred timing, prioritize it
                    if (!a.preferredTiming && b.preferredTiming) {
                        return 1;
                    } else if (a.preferredTiming && !b.preferredTiming) {
                        return -1;
                    }

                    // If both cases have preferred timings, compare dates first, and then preferred timings
                    if (dateA > dateB) {
                        return -1;
                    } else if (dateA < dateB) {
                        return 1;
                    } else {
                        // Dates are equal, compare preferred timings
                        const timeA = parseInt(a.preferredTiming.split("-")[0]);
                        const timeB = parseInt(b.preferredTiming.split("-")[0]);

                        // Compare preferred timings
                        if (timeA > timeB) {
                            return 1;
                        } else if (timeA < timeB) {
                            return -1;
                        } else {
                            // If preferred timings are also equal, maintain the original order
                            return 0;
                        }
                    }
                }
            });
            response.order = array;
            log.info(`Found a order with phone No ${phoneNo}`);
            return res.status(200).send({
                statusCode: 200,
                result: response,
                // message: `Found a order with phoneno ${phoneNo}`
            })
        }

    })
}

async function getaddressByIdDao(req, res) {
    // const _orderId = orderInfo._orderId;
    const addressId = req.body.addressId;
    await UserModel.findOne({ 'address._id': addressId }, async (err, response) => {
        if (err || !response) {
            log.error(`Error in finding user with ${addressId}` + err);
            return res.status(400).send({
                username: addressId,
                statusCode: 400,
                message: 'No Address Found'
            });
        }
        else {
            // console.log(response);
            let array = [];
            // console.log(response.address);s
            for (let i = 0; i < response.address.length; i++) {
                if (response.address[i]._id == addressId) {
                    array.push(response.address[i]);
                    break;
                }
            }
            console.log(array);
            log.info(`Foudn a user with data ${addressId}`);
            return res.status(200).send({
                statusCode: 200,
                // username: username,
                result: array[0],
                message: 'Found a user with ' + addressId
            })
        }
    })

    // console.log({ _orderId });
}

async function updateOrderStatusDao(req, res) {
    const orderInfo = req.body;
    const status = orderInfo.status;
    const fuelAmount = orderInfo.fuelAmount;
    const totalAmount = orderInfo.totalAmount;
    const orderID = orderInfo.orderID;
    const username = req.username
    const result = await orderModel.findOneAndUpdate(
        {
            "order._id": orderID
        },
        {
            $set: {
                "order.$.status": status,
                "order.$.totalAmount": totalAmount,
                "order.$.fuelAmount": fuelAmount,
                "order.$.driver": username,
            }
        },
        { new: true, upsert: true },
        (err, response) => {
            if (err || !response) {
                log.error('cannot find a maatch for phone no and order id');
                return res.status(500).send({
                    message: 'Error in updating order status'
                })
            }
            else {
                console.log(response.order[1]);
                log.info(`Successfully updated order status `);
                return res.status(200).send({
                    statusCode: 200,
                    message: 'Successfully delivered Order'
                })
            }

        })
    return result;
}

async function updateOrderDetailsDao(orderInfo, res) {
    const phoneNo = orderInfo.phoneNo;
    const orderID = orderInfo.orderID;
    const status = orderInfo.status;

    console.log({ phoneNo }, { status });

    await orderModel.findOneAndUpdate(
        {
            phoneNo: phoneNo,
            "order._id": orderID
        },
        {
            $set: {
                "order.$.status": status,

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
            else {
                console.log(response.order[1]);
                log.info(`Successfully updated order Details `);
                return res.status(200).send({
                    statusCode: 200,
                    message: 'Successfully updated order details'
                })
            }
        })
}

async function phoneExists(phoneNo) {
    return await UserModel.findOne({ phoneNo: phoneNo });
}

async function paymentBeforeOrderDao(req, res) {
    try {
        const token = req.header('x-auth-token');

        const orderInfo = req.body
        if (orderInfo.order.paymentMethod != "online") {
            return res.status(400).send({
                message: "Authentication Error",
                statusCode: 400
            })
        }
        if (!orderInfo.order || !orderInfo.order.fuelAmount || isNaN(orderInfo.order.fuelAmount) || parseInt(orderInfo.order.fuelAmount) <= 0) {
            return res.status(400).json({ message: 'Invalid order total amount' });
        }


        // console.log({ orderInfo });
        const phone = req.phoneNo
        const payload = await phoneExists(phone);
        if (!payload) {
            return res.status(404).send({
                message: 'Cant find the user with phoneNo ' + orderInfo.phoneNo
            })
        }

        const reqAdr = orderInfo.order.addressId;
        let Order = orderInfo.order;

        // ***********************************************************************************
        // checking for slot availability 

        const schedules = await ScheduleModel.find({});
        let foundDate = false;
        let availableSlot;
        if (!orderInfo.order.emergency) {
            for (let i = 0; i < 4; i++) {
                console.log(schedules[0].schedule[i].showDate);
                if (schedules[0].schedule[i].showDate == orderInfo.order.Date) {
                    // console.log("ok");
                    log.info("found the date available in the mongoDB ")
                    availableSlot = schedules[0].schedule[i];
                    foundDate = true;
                    break;

                }
            };
            if (foundDate == false) {
                return res.status(404).send({
                    message: 'Cannot find schedule for the specified date: ' + orderInfo.order.Date
                });
            }
            else {

                const fuelType = orderInfo.order.fuelType.toLowerCase(); // Convert to lowercase for case-insensitive comparison

                // Find the slot for the preferred timing
                const preferredSlot = availableSlot.slots.find(slot => slot.time === orderInfo.order.preferredTiming);

                if (!preferredSlot) {
                    return res.status(404).send({
                        message: 'Cannot find a slot for the specified preferred timing: ' + orderInfo.order.preferredTiming
                    });
                }

                // Check if the specified fuel type has available slots
                if (preferredSlot[fuelType] >= 2) {
                    return res.status(409).send({
                        message: 'This slot is fully booked for ' + fuelType + ' fuel type.'
                    });
                }
                log.info("The seletect slot is " + preferredSlot.time + " for fuel type " + fuelType)
                // ***********************************************************************************
                preferredSlot[fuelType] += 1;

                let {
                    _id,
                    name,
                    phoneNo,
                    myself,
                    saveas,
                    fulladdr,
                    vehicle,
                    vnumber,
                    totalAmount
                } = "";
                let flag = false;
                async function searchAdrId() {
                    payload.address.map((index) => {
                        // console.log(index);
                        // console.log(index._id, "dbId ", reqAdr);
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
                        message: 'Please add a address first to make an order. Cannot find a address with this ID: ' + orderInfo.order.addressId
                    })
                }
                else {
                    // logic for coupan
                    if (orderInfo.order.CoupanId) {
                        await CoupanModel.findOne({ code: orderInfo.order.CoupanId }, async (err, response) => {
                            if (err || !response) {
                                // console.log({ response });
                                return res.status(400).send({
                                    message: 'Cannot find a coupan with this code'
                                })
                            }
                            else {

                                await FuelModel.find({}, async (e, fuelRates) => {
                                    if (e || !fuelRates) {
                                        // console.log(r);
                                        log.error(`Error in finding fuel value` + e);
                                        return res.status(400).send({
                                            message: 'Error in finding fuel value'
                                        })
                                    }
                                    else {
                                        log.info(` fuel value entered`);
                                        const fuelType = orderInfo.order.fuelType;
                                        // Find the matching fuel rate based on fuelType
                                        const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                                        let rate;
                                        console.log(fuelRates);
                                        if (matchingFuel) {
                                            // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                            rate = matchingFuel[fuelType.toLowerCase()];

                                            if (rate) {
                                                console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                                // return res.send("ok");
                                            } else {
                                                console.log(`Rate for fuel type ${fuelType} not found in database`);
                                                return res.status(404).send({
                                                    message: `Rate for fuel type ${fuelType} not found!!`
                                                });
                                            }
                                        } else {
                                            console.log(`Fuel type ${fuelType} not found in database`);
                                            return res.status(404).send({
                                                message: `Fuel type ${fuelType} not found!!`
                                            });
                                        }

                                        // rate = parseInt(rate);

                                        // const Amount = parseInt(orderInfo.order.fuelAmount) * rate;
                                        rate = parseFloat(rate.replace('$', ''));

                                        let totalAmount = parseFloat(orderInfo.order.fuelAmount) * rate;
                                        console.log(parseFloat(orderInfo.order.fuelAmount));
                                        // console.log({ totalAmount });
                                        const discount = response.discount;
                                        const temp = parseFloat(discount);
                                        // console.log(parseInt(orderInfo.order.fuelAmount));
                                        totalAmount = ((100 - temp) / 100) * totalAmount;
                                        totalAmount = parseFloat(totalAmount.toFixed(2));

                                        console.log({ totalAmount });
                                        if (orderInfo.order.emergency == true) {
                                            totalAmount = totalAmount + 20;
                                        }




                                        // payment
                                        try {

                                            const session = await stripe.checkout.sessions.create({
                                                payment_method_types: ['card'],
                                                // customer_email: "hey@gmail.com",

                                                line_items: [{
                                                    price_data: {
                                                        currency: 'cad',
                                                        product_data: {
                                                            name: fuelType,
                                                        },
                                                        unit_amount: parseInt(totalAmount * 100),
                                                    },
                                                    quantity: 1,
                                                }],
                                                mode: 'payment',
                                                success_url: 'http://localhost:8100/success', // Redirect after successful payment
                                                cancel_url: 'http://localhost:8100/cancel',   // Redirect on cancellation
                                                metadata: {
                                                    token: token,
                                                    OrderDetails: JSON.stringify(orderInfo),
                                                },
                                            });
                                            res.status(200).send({ statusCode: 200, id: session.url, message: "Please Pay Online" });
                                        } catch (error) {
                                            console.log(error);
                                            res.status(400).send({
                                                statusCode: 400,
                                                message: "Something Went Wrong"
                                            })
                                        }
                                    }
                                })




                            }
                        })
                    }

                    else {
                        await FuelModel.find({}, async (e, fuelRates) => {
                            if (e || !fuelRates) {
                                // console.log(r);
                                log.error(`Error in finding fuel value` + e);
                                return res.status(400).send({
                                    message: 'Error in finding fuel value'
                                })
                            }
                            else {
                                const fuelType = orderInfo.order.fuelType;

                                // Find the matching fuel rate based on fuelType
                                const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                                let rate;
                                if (matchingFuel) {
                                    // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                    rate = matchingFuel[fuelType.toLowerCase()];

                                    if (rate) {
                                        console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                        // return res.send("ok");
                                    } else {
                                        console.log(`Rate for fuel type ${fuelType} not found in database`);
                                        return res.status(404).send({
                                            message: `Rate for fuel type ${fuelType} not found in database`
                                        });
                                    }
                                } else {
                                    console.log(`Fuel type ${fuelType} not found in database`);
                                    return res.status(404).send({
                                        message: `Fuel type ${fuelType} not found in database`
                                    });
                                }

                                // rate = parseInt(rate);

                                // const totalAmount = parseInt(orderInfo.order.fuelAmount) * rate;
                                // rate = parseFloat(rate);
                                rate = parseFloat(rate.replace('$', ''));
                                let totalAmount = parseFloat(orderInfo.order.fuelAmount) * rate;

                                // console.log(parseInt(orderInfo.order.fuelAmount));
                                console.log({ rate });
                                console.log(parseFloat(orderInfo.order.fuelAmount)
                                );
                                totalAmount = parseFloat(totalAmount.toFixed(2));

                                console.log({ totalAmount });
                                if (orderInfo.order.emergency == true) {
                                    totalAmount = totalAmount + 20;
                                }
                                // PAYMENT

                                try {

                                    const session = await stripe.checkout.sessions.create({
                                        payment_method_types: ['card'],
                                        // customer_email: "hey@gmail.com",

                                        line_items: [{
                                            price_data: {
                                                currency: 'cad',
                                                product_data: {
                                                    name: fuelType,
                                                },
                                                unit_amount: parseInt(totalAmount * 100),
                                            },
                                            quantity: 1,
                                        }],
                                        mode: 'payment',
                                        success_url: 'http://localhost:8100/success', // Redirect after successful payment
                                        cancel_url: 'http://localhost:8100/cancel',   // Redirect on cancellation
                                        metadata: {
                                            token: token,
                                            OrderDetails: JSON.stringify(orderInfo),
                                        },
                                    });
                                    res.status(200).send({ statusCode: 200, id: session.url, message: "Please Pay Online" });
                                } catch (error) {
                                    console.log(error);
                                    res.status(400).send({
                                        statusCode: 400,
                                        message: "Something Went Wrong"
                                    })
                                }
                            }
                        })

                    }
                }
            }
        }
        else {
            const fuelType = orderInfo.order.fuelType.toLowerCase(); // Convert to lowercase for case-insensitive comparison

            let {
                _id,
                name,
                phoneNo,
                myself,
                saveas,
                fulladdr,
                vehicle,
                vnumber,
                totalAmount
            } = "";
            let flag = false;
            async function searchAdrId() {
                payload.address.map((index) => {
                    // console.log(index);
                    // console.log(index._id, "dbId ", reqAdr);
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
                    message: 'Please add a address first to make an order. Cannot find a address with this ID: ' + orderInfo.order.addressId
                })
            }
            else {
                // logic for coupan
                if (orderInfo.order.CoupanId) {
                    await CoupanModel.findOne({ code: orderInfo.order.CoupanId }, async (err, response) => {
                        if (err || !response) {
                            // console.log({ response });
                            return res.status(400).send({
                                message: 'Cannot find a coupan with this code'
                            })
                        }
                        else {

                            await FuelModel.find({}, async (e, fuelRates) => {
                                if (e || !fuelRates) {
                                    // console.log(r);
                                    log.error(`Error in finding fuel value` + e);
                                    return res.status(400).send({
                                        message: 'Error in finding fuel value'
                                    })
                                }
                                else {
                                    log.info(` fuel value entered`);
                                    const fuelType = orderInfo.order.fuelType;
                                    // Find the matching fuel rate based on fuelType
                                    const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                                    let rate;
                                    console.log(fuelRates);
                                    if (matchingFuel) {
                                        // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                        rate = matchingFuel[fuelType.toLowerCase()];

                                        if (rate) {
                                            console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                            // return res.send("ok");
                                        } else {
                                            console.log(`Rate for fuel type ${fuelType} not found in database`);
                                            return res.status(404).send({
                                                message: `Rate for fuel type ${fuelType} not found!!`
                                            });
                                        }
                                    } else {
                                        console.log(`Fuel type ${fuelType} not found in database`);
                                        return res.status(404).send({
                                            message: `Fuel type ${fuelType} not found!!`
                                        });
                                    }

                                    // rate = parseInt(rate);

                                    // const Amount = parseInt(orderInfo.order.fuelAmount) * rate;
                                    rate = parseFloat(rate.replace('$', ''));

                                    let totalAmount = parseFloat(orderInfo.order.fuelAmount) * rate;
                                    console.log(parseFloat(orderInfo.order.fuelAmount));
                                    // console.log({ totalAmount });
                                    const discount = response.discount;
                                    const temp = parseFloat(discount);
                                    // console.log(parseInt(orderInfo.order.fuelAmount));
                                    totalAmount = ((100 - temp) / 100) * totalAmount;
                                    totalAmount = parseFloat(totalAmount.toFixed(2));

                                    console.log({ totalAmount });
                                    if (orderInfo.order.emergency == true) {
                                        totalAmount = totalAmount + 20;
                                    }




                                    // payment
                                    try {

                                        const session = await stripe.checkout.sessions.create({
                                            payment_method_types: ['card'],
                                            // customer_email: "hey@gmail.com",

                                            line_items: [{
                                                price_data: {
                                                    currency: 'cad',
                                                    product_data: {
                                                        name: fuelType,
                                                    },
                                                    unit_amount: parseInt(totalAmount * 100),
                                                },
                                                quantity: 1,
                                            }],
                                            mode: 'payment',
                                            success_url: 'http://localhost:8100/success', // Redirect after successful payment
                                            cancel_url: 'http://localhost:8100/cancel',   // Redirect on cancellation
                                            metadata: {
                                                token: token,
                                                OrderDetails: JSON.stringify(orderInfo),
                                            },
                                        });
                                        res.status(200).send({ statusCode: 200, id: session.url, message: "Please Pay Online" });
                                    } catch (error) {
                                        console.log(error);
                                        res.status(400).send({
                                            statusCode: 400,
                                            message: "Something Went Wrong"
                                        })
                                    }
                                }
                            })




                        }
                    })
                }

                else {
                    await FuelModel.find({}, async (e, fuelRates) => {
                        if (e || !fuelRates) {
                            // console.log(r);
                            log.error(`Error in finding fuel value` + e);
                            return res.status(400).send({
                                message: 'Error in finding fuel value'
                            })
                        }
                        else {
                            const fuelType = orderInfo.order.fuelType;

                            // Find the matching fuel rate based on fuelType
                            const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                            let rate;
                            if (matchingFuel) {
                                // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                rate = matchingFuel[fuelType.toLowerCase()];

                                if (rate) {
                                    console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                    // return res.send("ok");
                                } else {
                                    console.log(`Rate for fuel type ${fuelType} not found in database`);
                                    return res.status(404).send({
                                        message: `Rate for fuel type ${fuelType} not found in database`
                                    });
                                }
                            } else {
                                console.log(`Fuel type ${fuelType} not found in database`);
                                return res.status(404).send({
                                    message: `Fuel type ${fuelType} not found in database`
                                });
                            }

                            // rate = parseInt(rate);

                            // const totalAmount = parseInt(orderInfo.order.fuelAmount) * rate;
                            // rate = parseFloat(rate);
                            rate = parseFloat(rate.replace('$', ''));
                            let totalAmount = parseFloat(orderInfo.order.fuelAmount) * rate;

                            // console.log(parseInt(orderInfo.order.fuelAmount));
                            console.log({ rate });
                            console.log(parseFloat(orderInfo.order.fuelAmount)
                            );
                            totalAmount = parseFloat(totalAmount.toFixed(2));

                            console.log({ totalAmount });
                            if (orderInfo.order.emergency == true) {
                                totalAmount = totalAmount + 20;
                            }
                            // PAYMENT

                            try {

                                const session = await stripe.checkout.sessions.create({
                                    payment_method_types: ['card'],
                                    // customer_email: "hey@gmail.com",

                                    line_items: [{
                                        price_data: {
                                            currency: 'cad',
                                            product_data: {
                                                name: fuelType,
                                            },
                                            unit_amount: parseInt(totalAmount * 100),
                                        },
                                        quantity: 1,
                                    }],
                                    mode: 'payment',
                                    success_url: 'http://localhost:8100/success', // Redirect after successful payment
                                    cancel_url: 'http://localhost:8100/cancel',   // Redirect on cancellation
                                    metadata: {
                                        token: token,
                                        OrderDetails: JSON.stringify(orderInfo),
                                    },
                                });
                                res.status(200).send({ statusCode: 200, id: session.url, message: "Please Pay Online" });
                            } catch (error) {
                                console.log(error);
                                res.status(400).send({
                                    statusCode: 400,
                                    message: "Something Went Wrong"
                                })
                            }
                        }
                    })

                }

            }
        }

    } catch (error) {
        return res.status(400).send({
            message: "error while adding new order " + error
        })
    }

}

async function addOrderDao(token, order) {
    try {

        console.log({ token });
        const payload_jwt = jwt.verify(token, secretKey);
        const phoneNo = payload_jwt.phoneNo;
        console.log(phoneNo);
        console.log(order);
        const payload = await phoneExists(phoneNo);
        if (!payload) {
            log.error("payload not found while ordering 1")
        }
        order = order.order;
        order.driver = "";
        const reqAdr = order.addressId;
        let Order = order;
        console.log(reqAdr);

        // ***********************************************************************************
        // checking for slot availability 

        const schedules = await ScheduleModel.find({});
        let foundDate = false;
        let availableSlot;
        if (!order.emergency) {
            for (let i = 0; i < 4; i++) {
                console.log(schedules[0].schedule[i].showDate);
                if (schedules[0].schedule[i].showDate == order.Date) {
                    // console.log("ok");
                    log.info("found the date available in the mongoDB ")
                    availableSlot = schedules[0].schedule[i];
                    foundDate = true;
                    break;

                }
            };
            if (foundDate == false) {
                log.error('Cannot find schedule for the specified date: ' + order.Date)
                return false;
                // return res.status(404).send({
                //     message: 'Cannot find schedule for the specified date: ' + order.Date
                // });
            }
            else {

                const fuelType = order.fuelType.toLowerCase(); // Convert to lowercase for case-insensitive comparison

                // Find the slot for the preferred timing
                const preferredSlot = availableSlot.slots.find(slot => slot.time === order.preferredTiming);

                if (!preferredSlot) {
                    log.error('Cannot find a slot for the specified preferred timing: ' + order.preferredTiming)
                    return false;
                    // return res.status(404).send({
                    //     message: 'Cannot find a slot for the specified preferred timing: ' + order.preferredTiming
                    // });
                }

                // Check if the specified fuel type has available slots
                if (preferredSlot[fuelType] >= 2) {
                    log.error('This slot is fully booked for ' + fuelType + ' fuel type.')
                    return false;
                    // return res.status(409).send({
                    //     message: 'This slot is fully booked for ' + fuelType + ' fuel type.'
                    // });
                }
                log.info("The seletect slot is " + preferredSlot.time + " for fuel type " + fuelType)
                // ***********************************************************************************
                preferredSlot[fuelType] += 1;

                let {
                    _id,
                    name,
                    phoneNo,
                    myself,
                    saveas,
                    fulladdr,
                    vehicle,
                    vnumber,
                    totalAmount
                } = "";
                let flag = false;
                async function searchAdrId() {
                    payload.address.map((index) => {
                        // console.log(index);
                        // console.log(index._id, "dbId ", reqAdr);
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
                    log.error('Please add a address first to make an order. Cannot find a address with this ID: ' + order.addressId)
                    return false;

                }
                else {
                    // logic for coupan
                    if (order.CoupanId) {
                        // console.log("coupan added");
                        await CoupanModel.findOne({ code: order.CoupanId }, async (err, response) => {
                            if (err || !response) {
                                // console.log({ response });
                                log.error('Cannot find a coupan with this code')
                                return false;
                                // return res.status(400).send({
                                //     message: 'Cannot find a coupan with this code'
                                // })
                            }
                            else {

                                await FuelModel.find({}, async (e, fuelRates) => {
                                    if (e || !fuelRates) {
                                        // console.log(r);
                                        log.error(`Error in finding fuel value` + e);
                                        // return res.status(400).send({
                                        //     message: 'Error in finding fuel value'
                                        // })
                                        return false;
                                    }
                                    else {
                                        log.info(` fuel value entered`);
                                        const fuelType = order.fuelType;
                                        // Find the matching fuel rate based on fuelType
                                        const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                                        let rate;
                                        console.log(fuelRates);
                                        if (matchingFuel) {
                                            // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                            rate = matchingFuel[fuelType.toLowerCase()];

                                            if (rate) {
                                                console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                                // return res.send("ok");
                                            } else {
                                                console.log(`Rate for fuel type ${fuelType} not found in database`);
                                                // return res.status(404).send({
                                                //     message: `Rate for fuel type ${fuelType} not found in database`
                                                // });
                                            }
                                        } else {
                                            console.log(`Fuel type ${fuelType} not found in database`);
                                            // return res.status(404).send({
                                            //     message: `Fuel type ${fuelType} not found in database`
                                            // });
                                        }

                                        // rate = parseInt(rate);

                                        // const Amount = parseInt(order.fuelAmount) * rate;
                                        // rate = parseFloat(rate);
                                        rate = parseFloat(rate.replace('$', ''));
                                        let totalAmount = parseFloat(order.fuelAmount) * rate;

                                        console.log(parseFloat(order.fuelAmount));
                                        // console.log({ totalAmount });
                                        const discount = response.discount;
                                        const temp = parseFloat(discount);
                                        // console.log(parseInt(order.fuelAmount));
                                        totalAmount = ((100 - temp) / 100) * totalAmount;
                                        totalAmount = parseFloat(totalAmount.toFixed(2));

                                        console.log({ totalAmount });
                                        if (order.emergency == true) {
                                            totalAmount = totalAmount + 20;
                                        }

                                        // PAYMENT DONE order satrted

                                        let orderDetails = await orderModel.findOne({ phoneNo: phoneNo });
                                        // console.log({ orderDetails });
                                        let index = 0;
                                        // console.log({ index });
                                        if (orderDetails) {
                                            index = orderDetails.order.length;
                                        }
                                        let newOrder;
                                        if (order.fullTank == true) {
                                            newOrder = {
                                                "name": order.name,
                                                "fuelType": order.fuelType,
                                                "fuelAmount": order.fuelAmount,
                                                "emergency": order.emergency,
                                                "fullTank": order.fullTank,
                                                "Date": order.Date,
                                                "preferredTiming": order.preferredTiming,
                                                "CoupanId": order.CoupanId,
                                                "addressId": order.addressId,
                                                "status": order.status,
                                                "paymentMethod": order.paymentMethod,
                                                "paymentIntentId": "cod",
                                                "totalAmount": -1
                                            };
                                        }
                                        else {
                                            newOrder = {
                                                "name": order.name,
                                                "fuelType": order.fuelType,
                                                "fuelAmount": order.fuelAmount,
                                                "emergency": order.emergency,
                                                "fullTank": order.fullTank,
                                                "Date": order.Date,
                                                "preferredTiming": order.preferredTiming,
                                                "CoupanId": order.CoupanId,
                                                "addressId": order.addressId,
                                                "status": order.status,
                                                "paymentMethod": order.paymentMethod,
                                                "paymentIntentId": "cod",
                                                "driver": order.driver,
                                                "totalAmount": totalAmount
                                            };
                                        }

                                        if (order.transactionId) {
                                            newOrder.paymentIntentId = order.transactionId;
                                        }
                                        if (index === 0) {
                                            const newOrderDocument = new orderModel({
                                                "phoneNo": phoneNo,
                                                "order": [newOrder]
                                            });

                                            try {
                                                console.log(newOrder);
                                                const result = await newOrderDocument.save(async (err, result) => {
                                                    if (err) {
                                                        log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                                        // return res.status(500).send({
                                                        //     message: 'phoneNo ' + phone + ' Error in saving first order.'
                                                        // });
                                                        return false;
                                                    }
                                                    else {

                                                        await ScheduleModel.findOneAndUpdate(
                                                            { "schedule.showDate": order.Date },
                                                            { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                            {
                                                                arrayFilters: [
                                                                    { "outer.showDate": order.Date },
                                                                    { "inner.time": preferredSlot.time }
                                                                ],
                                                                new: true
                                                            },
                                                            (error, updatedDocument) => {
                                                                if (error) {
                                                                    log.error('Error updating schedule:', error);
                                                                    // Handle the error as needed
                                                                    return false;
                                                                } else {
                                                                    log.info('Schedule updated successfully:', updatedDocument);
                                                                    // Continue with any additional logic if needed
                                                                }
                                                            }
                                                        );
                                                        log.info(result.phoneNo + ' has just ordered for the first time!');
                                                        log.info('Your first order is queued successfully.');
                                                        // return res.status(200).send({
                                                        //     statusCode: 200,
                                                        //     message: 'Your first order is queued successfully.',
                                                        //     phoneNo: result.phoneNo
                                                        // });

                                                    }
                                                });
                                                // console.log("11");
                                                return result;
                                                // const result = await newOrderDocument.save();

                                                // Update schedule here if needed

                                                // return result;
                                            } catch (err) {
                                                log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                                return false;
                                            }
                                        } else {
                                            try {
                                                const check = orderDetails.order;
                                                check.push(newOrder)
                                                console.log(newOrder);
                                                const result = await orderModel.findOneAndUpdate(
                                                    { phoneNo: phoneNo },
                                                    { $set: { order: check } },
                                                    { new: true, upsert: true }
                                                    , async (err, response) => {
                                                        console.log("updatePoint");
                                                        if (err || !response) {
                                                            console.log(response);
                                                            log.error(`Error in adding new order` + err);
                                                            // return res.status(400).send({
                                                            //     message: 'Error in adding new order'
                                                            // })
                                                            return false;
                                                        }
                                                        else {
                                                            await ScheduleModel.findOneAndUpdate(
                                                                { "schedule.showDate": order.Date },
                                                                { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                                {
                                                                    arrayFilters: [
                                                                        { "outer.showDate": order.Date },
                                                                        { "inner.time": preferredSlot.time }
                                                                    ],
                                                                    new: true
                                                                },
                                                                (error, updatedDocument) => {
                                                                    if (error) {
                                                                        log.error('Error updating schedule:', error);
                                                                        // Handle the error as needed
                                                                        return false;
                                                                    } else {
                                                                        log.info('Schedule updated successfully:', updatedDocument);
                                                                        // Continue with any additional logic if needed
                                                                    }
                                                                }
                                                            );
                                                            log.info(`Sucessfully added new order in the order array to phoneNo ${phoneNo}`);
                                                            // return res.status(200).send({
                                                            //     statusCode: 200,
                                                            //     message: 'Successfully added new order',
                                                            // })

                                                        }

                                                    })
                                                return result;

                                            } catch (err) {
                                                log.error(`Error in adding new order` + err);
                                                return false;
                                            }
                                        }

                                    }
                                })




                            }
                        })
                    }

                    else {
                        await FuelModel.find({}, async (e, fuelRates) => {
                            if (e || !fuelRates) {
                                // console.log(r);
                                log.error(`Error in finding fuel value` + e);
                                return false;
                                // return res.status(400).send({
                                //     message: 'Error in finding fuel value'
                                // })
                            }
                            else {
                                const fuelType = order.fuelType;

                                // Find the matching fuel rate based on fuelType
                                const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                                let rate;
                                if (matchingFuel) {
                                    // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                    rate = matchingFuel[fuelType.toLowerCase()];

                                    if (rate) {
                                        console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                        // return res.send("ok");
                                    } else {
                                        console.log(`Rate for fuel type ${fuelType} not found in database`);
                                        // return res.status(404).send({
                                        //     message: `Rate for fuel type ${fuelType} not found in database`
                                        // });
                                    }
                                } else {
                                    console.log(`Fuel type ${fuelType} not found in database`);
                                    // return res.status(404).send({
                                    //     message: `Fuel type ${fuelType} not found in database`
                                    // });
                                }

                                // rate = parseInt(rate);

                                // const totalAmount = parseInt(order.fuelAmount) * rate;
                                rate = parseFloat(rate.replace('$', ''));
                                //  console.log(rate);
                                let totalAmount = parseFloat(order.fuelAmount) * rate;

                                console.log(parseInt(order.fuelAmount));
                                totalAmount = parseFloat(totalAmount.toFixed(2));

                                console.log({ totalAmount });

                                if (order.emergency == true) {
                                    totalAmount = totalAmount + 20;
                                }


                                let orderDetails = await orderModel.findOne({ phoneNo: phoneNo });
                                // console.log({ orderDetails });
                                let index = 0;
                                // console.log({ index });
                                if (orderDetails) {
                                    index = orderDetails.order.length;
                                }
                                let newOrder;
                                if (order.fullTank == true) {
                                    newOrder = {
                                        "name": order.name,
                                        "fuelType": order.fuelType,
                                        "fuelAmount": order.fuelAmount,
                                        "emergency": order.emergency,
                                        "fullTank": order.fullTank,
                                        "Date": order.Date,
                                        "preferredTiming": order.preferredTiming,
                                        "CoupanId": order.CoupanId,
                                        "addressId": order.addressId,
                                        "status": order.status,
                                        "paymentMethod": order.paymentMethod,
                                        "driver": order.driver,
                                        "paymentIntentId": "cod",
                                        "totalAmount": -1
                                    };
                                }
                                else {
                                    newOrder = {
                                        "name": order.name,
                                        "fuelType": order.fuelType,
                                        "fuelAmount": order.fuelAmount,
                                        "emergency": order.emergency,
                                        "fullTank": order.fullTank,
                                        "Date": order.Date,
                                        "preferredTiming": order.preferredTiming,
                                        "CoupanId": order.CoupanId,
                                        "addressId": order.addressId,
                                        "status": order.status,
                                        "paymentMethod": order.paymentMethod,
                                        "driver": order.driver,
                                        "paymentIntentId": "cod",
                                        "totalAmount": totalAmount
                                    };
                                }
                                if (order.transactionId) {
                                    newOrder.paymentIntentId = order.transactionId;
                                }
                                if (index === 0) {
                                    const newOrderDocument = new orderModel({
                                        "phoneNo": phoneNo,
                                        "order": [newOrder]
                                    });

                                    try {
                                        console.log(newOrder);
                                        const result = await newOrderDocument.save(async (err, result) => {
                                            if (err) {
                                                log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                                // return res.status(500).send({
                                                //     message: 'phoneNo ' + phone + ' Error in saving first order.'
                                                // });
                                                return false;
                                            }
                                            else {

                                                await ScheduleModel.findOneAndUpdate(
                                                    { "schedule.showDate": order.Date },
                                                    { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                    {
                                                        arrayFilters: [
                                                            { "outer.showDate": order.Date },
                                                            { "inner.time": preferredSlot.time }
                                                        ],
                                                        new: true
                                                    },
                                                    (error, updatedDocument) => {
                                                        if (error) {
                                                            log.error('Error updating schedule:', error);
                                                            // Handle the error as needed
                                                            return false;
                                                        } else {
                                                            log.info('Schedule updated successfully:', updatedDocument);
                                                            // Continue with any additional logic if needed
                                                        }
                                                    }
                                                );
                                                log.info(result.phoneNo + ' has just ordered for the first time!');
                                                log.info('Your first order is queued successfully.');
                                                // return res.status(200).send({
                                                //     statusCode: 200,
                                                //     message: 'Your first order is queued successfully.',
                                                //     phoneNo: result.phoneNo
                                                // });

                                            }
                                        });
                                        // console.log("11");
                                        return result;
                                        // const result = await newOrderDocument.save();

                                        // Update schedule here if needed

                                        // return result;
                                    } catch (err) {
                                        log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                        return false;
                                    }
                                } else {
                                    try {

                                        const check = orderDetails.order;
                                        check.push(newOrder)
                                        console.log(newOrder);
                                        const result = await orderModel.findOneAndUpdate(
                                            { phoneNo: phoneNo },
                                            { $set: { order: check } },
                                            { new: true, upsert: true }
                                            , async (err, response) => {
                                                console.log("updatePoint");
                                                if (err || !response) {
                                                    console.log(response);
                                                    log.error(`Error in adding new order` + err);
                                                    // return res.status(400).send({
                                                    //     message: 'Error in adding new order'
                                                    // })
                                                    return false;
                                                }
                                                else {
                                                    await ScheduleModel.findOneAndUpdate(
                                                        { "schedule.showDate": order.Date },
                                                        { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                        {
                                                            arrayFilters: [
                                                                { "outer.showDate": order.Date },
                                                                { "inner.time": preferredSlot.time }
                                                            ],
                                                            new: true
                                                        },
                                                        (error, updatedDocument) => {
                                                            if (error) {
                                                                log.error('Error updating schedule:', error);
                                                                // Handle the error as needed
                                                                return false;
                                                            } else {
                                                                log.info('Schedule updated successfully:', updatedDocument);
                                                                // Continue with any additional logic if needed
                                                            }
                                                        }
                                                    );
                                                    log.info(`Sucessfully added new order in the order array to phoneNo ${phoneNo}`);
                                                    // return res.status(200).send({
                                                    //     statusCode: 200,
                                                    //     message: 'Successfully added new order',
                                                    // })

                                                }

                                            })
                                        return result;

                                    } catch (err) {
                                        log.error(`Error in adding new order` + err);
                                        return false;
                                    }
                                }



                            }
                        })

                    }
                }
            }
        }
        else {



            const fuelType = order.fuelType.toLowerCase(); // Convert to lowercase for case-insensitive comparison


            let {
                _id,
                name,
                phoneNo,
                myself,
                saveas,
                fulladdr,
                vehicle,
                vnumber,
                totalAmount
            } = "";
            let flag = false;
            async function searchAdrId() {
                payload.address.map((index) => {
                    // console.log(index);
                    // console.log(index._id, "dbId ", reqAdr);
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
                log.error('Please add a address first to make an order. Cannot find a address with this ID: ' + order.addressId)
                return false;

            }
            else {
                // logic for coupan
                if (order.CoupanId) {
                    await CoupanModel.findOne({ code: order.CoupanId }, async (err, response) => {
                        if (err || !response) {
                            // console.log({ response });
                            log.error('Cannot find a coupan with this code')
                            return false;
                            // return res.status(400).send({
                            //     message: 'Cannot find a coupan with this code'
                            // })
                        }
                        else {

                            await FuelModel.find({}, async (e, fuelRates) => {
                                if (e || !fuelRates) {
                                    // console.log(r);
                                    log.error(`Error in finding fuel value` + e);
                                    // return res.status(400).send({
                                    //     message: 'Error in finding fuel value'
                                    // })
                                    return false;
                                }
                                else {
                                    log.info(` fuel value entered`);
                                    const fuelType = order.fuelType;
                                    // Find the matching fuel rate based on fuelType
                                    const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                                    let rate;
                                    console.log(fuelRates);
                                    if (matchingFuel) {
                                        // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                        rate = matchingFuel[fuelType.toLowerCase()];

                                        if (rate) {
                                            console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                            // return res.send("ok");
                                        } else {
                                            console.log(`Rate for fuel type ${fuelType} not found in database`);
                                            // return res.status(404).send({
                                            //     message: `Rate for fuel type ${fuelType} not found in database`
                                            // });
                                        }
                                    } else {
                                        console.log(`Fuel type ${fuelType} not found in database`);
                                        // return res.status(404).send({
                                        //     message: `Fuel type ${fuelType} not found in database`
                                        // });
                                    }

                                    // rate = parseInt(rate);

                                    // const Amount = parseInt(order.fuelAmount) * rate;
                                    // rate = parseFloat(rate);
                                    rate = parseFloat(rate.replace('$', ''));
                                    let totalAmount = parseFloat(order.fuelAmount) * rate;

                                    console.log(parseFloat(order.fuelAmount));
                                    // console.log({ totalAmount });
                                    const discount = response.discount;
                                    const temp = parseFloat(discount);
                                    // console.log(parseInt(order.fuelAmount));
                                    totalAmount = ((100 - temp) / 100) * totalAmount;
                                    totalAmount = parseFloat(totalAmount.toFixed(2));

                                    console.log({ totalAmount });
                                    if (order.emergency == true) {
                                        totalAmount = totalAmount + 20;
                                    }

                                    // PAYMENT DONE order satrted

                                    let orderDetails = await orderModel.findOne({ phoneNo: phoneNo });
                                    // console.log({ orderDetails });
                                    let index = 0;
                                    // console.log({ index });
                                    if (orderDetails) {
                                        index = orderDetails.order.length;
                                    }
                                    let newOrder;
                                    if (order.fullTank == true) {
                                        newOrder = {
                                            "name": order.name,
                                            "fuelType": order.fuelType,
                                            "fuelAmount": order.fuelAmount,
                                            "emergency": order.emergency,
                                            "fullTank": order.fullTank,
                                            // "Date": order.Date,
                                            // "preferredTiming": order.preferredTiming,
                                            "CoupanId": order.CoupanId,
                                            "addressId": order.addressId,
                                            "status": order.status,
                                            "paymentMethod": order.paymentMethod,
                                            "driver": order.driver,
                                            "paymentIntentId": "cod",
                                            "totalAmount": -1
                                        };
                                    }
                                    else {
                                        newOrder = {
                                            "name": order.name,
                                            "fuelType": order.fuelType,
                                            "fuelAmount": order.fuelAmount,
                                            "emergency": order.emergency,
                                            "fullTank": order.fullTank,
                                            // "Date": order.Date,
                                            // "preferredTiming": order.preferredTiming,
                                            "CoupanId": order.CoupanId,
                                            "addressId": order.addressId,
                                            "status": order.status,
                                            "paymentMethod": order.paymentMethod,
                                            "driver": order.driver,
                                            "paymentIntentId": "cod",
                                            "totalAmount": totalAmount
                                        };
                                    }

                                    if (order.transactionId) {
                                        newOrder.paymentIntentId = order.transactionId;
                                    }
                                    if (index === 0) {
                                        const newOrderDocument = new orderModel({
                                            "phoneNo": phoneNo,
                                            "order": [newOrder]
                                        });

                                        try {
                                            console.log(newOrder);
                                            const result = await newOrderDocument.save(async (err, result) => {
                                                if (err) {
                                                    log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                                    // return res.status(500).send({
                                                    //     message: 'phoneNo ' + phone + ' Error in saving first order.'
                                                    // });
                                                    return false;
                                                }
                                                else {

                                                    // await ScheduleModel.findOneAndUpdate(
                                                    //     { "schedule.showDate": order.Date },
                                                    //     { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                    //     {
                                                    //         arrayFilters: [
                                                    //             { "outer.showDate": order.Date },
                                                    //             { "inner.time": preferredSlot.time }
                                                    //         ],
                                                    //         new: true
                                                    //     },
                                                    //     (error, updatedDocument) => {
                                                    //         if (error) {
                                                    //             log.error('Error updating schedule:', error);
                                                    //             // Handle the error as needed
                                                    //             return false;
                                                    //         } else {
                                                    //             log.info('Schedule updated successfully:', updatedDocument);
                                                    //             // Continue with any additional logic if needed
                                                    //         }
                                                    //     }
                                                    // );
                                                    log.info(result.phoneNo + ' has just ordered for the first time!');
                                                    log.info('Your first order is queued successfully.');
                                                    // return res.status(200).send({
                                                    //     statusCode: 200,
                                                    //     message: 'Your first order is queued successfully.',
                                                    //     phoneNo: result.phoneNo
                                                    // });

                                                }
                                            });
                                            // console.log("11");
                                            return result;
                                            // const result = await newOrderDocument.save();

                                            // Update schedule here if needed

                                            // return result;
                                        } catch (err) {
                                            log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                            return false;
                                        }
                                    } else {
                                        try {
                                            const check = orderDetails.order;
                                            check.push(newOrder)
                                            console.log(newOrder);
                                            const result = await orderModel.findOneAndUpdate(
                                                { phoneNo: phoneNo },
                                                { $set: { order: check } },
                                                { new: true, upsert: true }
                                                , async (err, response) => {
                                                    console.log("updatePoint");
                                                    if (err || !response) {
                                                        console.log(response);
                                                        log.error(`Error in adding new order` + err);
                                                        // return res.status(400).send({
                                                        //     message: 'Error in adding new order'
                                                        // })
                                                        return false;
                                                    }
                                                    else {
                                                        // await ScheduleModel.findOneAndUpdate(
                                                        //     { "schedule.showDate": order.Date },
                                                        //     { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                        //     {
                                                        //         arrayFilters: [
                                                        //             { "outer.showDate": order.Date },
                                                        //             { "inner.time": preferredSlot.time }
                                                        //         ],
                                                        //         new: true
                                                        //     },
                                                        //     (error, updatedDocument) => {
                                                        //         if (error) {
                                                        //             log.error('Error updating schedule:', error);
                                                        //             // Handle the error as needed
                                                        //             return false;
                                                        //         } else {
                                                        //             log.info('Schedule updated successfully:', updatedDocument);
                                                        //             // Continue with any additional logic if needed
                                                        //         }
                                                        //     }
                                                        // );
                                                        log.info(`Sucessfully added new order in the order array to phoneNo ${phoneNo}`);
                                                        // return res.status(200).send({
                                                        //     statusCode: 200,
                                                        //     message: 'Successfully added new order',
                                                        // })

                                                    }

                                                })
                                            return result;

                                        } catch (err) {
                                            log.error(`Error in adding new order` + err);
                                            return false;
                                        }
                                    }

                                }
                            })




                        }
                    })
                }

                else {
                    await FuelModel.find({}, async (e, fuelRates) => {
                        if (e || !fuelRates) {
                            // console.log(r);
                            log.error(`Error in finding fuel value` + e);
                            return false;
                            // return res.status(400).send({
                            //     message: 'Error in finding fuel value'
                            // })
                        }
                        else {
                            const fuelType = order.fuelType;

                            // Find the matching fuel rate based on fuelType
                            const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                            let rate;
                            if (matchingFuel) {
                                // Access the rate of the matching fuel type using matchingFuel[fuelType]
                                rate = matchingFuel[fuelType.toLowerCase()];

                                if (rate) {
                                    console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                    // return res.send("ok");
                                } else {
                                    console.log(`Rate for fuel type ${fuelType} not found in database`);
                                    // return res.status(404).send({
                                    //     message: `Rate for fuel type ${fuelType} not found in database`
                                    // });
                                }
                            } else {
                                console.log(`Fuel type ${fuelType} not found in database`);
                                // return res.status(404).send({
                                //     message: `Fuel type ${fuelType} not found in database`
                                // });
                            }

                            // rate = parseInt(rate);

                            // const totalAmount = parseInt(order.fuelAmount) * rate;
                            rate = parseFloat(rate.replace('$', ''));
                            //  console.log(rate);
                            let totalAmount = parseFloat(order.fuelAmount) * rate;

                            console.log(parseInt(order.fuelAmount));
                            totalAmount = parseFloat(totalAmount.toFixed(2));

                            console.log({ totalAmount });
                            if (order.emergency == true) {
                                totalAmount = totalAmount + 20;
                            }


                            let orderDetails = await orderModel.findOne({ phoneNo: phoneNo });
                            // console.log({ orderDetails });
                            let index = 0;
                            // console.log({ index });
                            if (orderDetails) {
                                index = orderDetails.order.length;
                            }
                            let newOrder;
                            if (order.fullTank == true) {
                                newOrder = {
                                    "name": order.name,
                                    "fuelType": order.fuelType,
                                    "fuelAmount": order.fuelAmount,
                                    "emergency": order.emergency,
                                    "fullTank": order.fullTank,
                                    // "Date": order.Date,
                                    // "preferredTiming": order.preferredTiming,
                                    "CoupanId": order.CoupanId,
                                    "addressId": order.addressId,
                                    "status": order.status,
                                    "paymentMethod": order.paymentMethod,
                                    "driver": order.driver,
                                    "paymentIntentId": "cod",
                                    "totalAmount": -1
                                };
                            }
                            else {
                                newOrder = {
                                    "name": order.name,
                                    "fuelType": order.fuelType,
                                    "fuelAmount": order.fuelAmount,
                                    "emergency": order.emergency,
                                    "fullTank": order.fullTank,
                                    // "Date": order.Date,
                                    // "preferredTiming": order.preferredTiming,
                                    "CoupanId": order.CoupanId,
                                    "addressId": order.addressId,
                                    "status": order.status,
                                    "paymentMethod": order.paymentMethod,
                                    "driver": order.driver,
                                    "paymentIntentId": "cod",
                                    "totalAmount": totalAmount
                                };
                            }
                            if (order.transactionId) {
                                newOrder.paymentIntentId = order.transactionId;
                            }
                            if (index === 0) {
                                const newOrderDocument = new orderModel({
                                    "phoneNo": phoneNo,
                                    "order": [newOrder]
                                });

                                try {
                                    console.log(newOrder);
                                    const result = await newOrderDocument.save(async (err, result) => {
                                        if (err) {
                                            log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                            // return res.status(500).send({
                                            //     message: 'phoneNo ' + phone + ' Error in saving first order.'
                                            // });
                                            return false;
                                        }
                                        else {

                                            // await ScheduleModel.findOneAndUpdate(
                                            //     { "schedule.showDate": order.Date },
                                            //     { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                            //     {
                                            //         arrayFilters: [
                                            //             { "outer.showDate": order.Date },
                                            //             { "inner.time": preferredSlot.time }
                                            //         ],
                                            //         new: true
                                            //     },
                                            //     (error, updatedDocument) => {
                                            //         if (error) {
                                            //             log.error('Error updating schedule:', error);
                                            //             // Handle the error as needed
                                            //             return false;
                                            //         } else {
                                            //             log.info('Schedule updated successfully:', updatedDocument);
                                            //             // Continue with any additional logic if needed
                                            //         }
                                            //     }
                                            // );
                                            log.info(result.phoneNo + ' has just ordered for the first time!');
                                            log.info('Your first order is queued successfully.');
                                            // return res.status(200).send({
                                            //     statusCode: 200,
                                            //     message: 'Your first order is queued successfully.',
                                            //     phoneNo: result.phoneNo
                                            // });

                                        }
                                    });
                                    // console.log("11");
                                    return result;
                                    // const result = await newOrderDocument.save();

                                    // Update schedule here if needed

                                    // return result;
                                } catch (err) {
                                    log.error(`Error in adding first order for phoneNo ${phoneNo}: ` + err);
                                    return false;
                                }
                            } else {
                                try {

                                    const check = orderDetails.order;
                                    check.push(newOrder)
                                    console.log(newOrder);
                                    const result = await orderModel.findOneAndUpdate(
                                        { phoneNo: phoneNo },
                                        { $set: { order: check } },
                                        { new: true, upsert: true }
                                        , async (err, response) => {
                                            console.log("updatePoint");
                                            if (err || !response) {
                                                console.log(response);
                                                log.error(`Error in adding new order` + err);
                                                // return res.status(400).send({
                                                //     message: 'Error in adding new order'
                                                // })
                                                return false;
                                            }
                                            else {
                                                // await ScheduleModel.findOneAndUpdate(
                                                //     { "schedule.showDate": order.Date },
                                                //     { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                //     {
                                                //         arrayFilters: [
                                                //             { "outer.showDate": order.Date },
                                                //             { "inner.time": preferredSlot.time }
                                                //         ],
                                                //         new: true
                                                //     },
                                                //     (error, updatedDocument) => {
                                                //         if (error) {
                                                //             log.error('Error updating schedule:', error);
                                                //             // Handle the error as needed
                                                //             return false;
                                                //         } else {
                                                //             log.info('Schedule updated successfully:', updatedDocument);
                                                //             // Continue with any additional logic if needed
                                                //         }
                                                //     }
                                                // );
                                                log.info(`Sucessfully added new order in the order array to phoneNo ${phoneNo}`);
                                                // return res.status(200).send({
                                                //     statusCode: 200,
                                                //     message: 'Successfully added new order',
                                                // })

                                            }

                                        })
                                    return result;

                                } catch (err) {
                                    log.error(`Error in adding new order` + err);
                                    return false;
                                }
                            }



                        }
                    })

                }
            }
        }



    } catch (error) {
        log.error("error while adding new order " + error)
        return false;
        // return res.status(400).send({
        //     message: "error while adding new order " + error
        // })
    }

}



async function updatedScheduleDao() {
    try {
        // Fetch the existing data from MongoDB
        const existingData = await ScheduleModel.find({}).sort({ date: 1 }).exec();

        if (existingData[0].schedule.length !== 4) {
            console.error('Error: Expected 4 days of data but found', existingData[0].schedule.length);
            return;
        }

        // Get today's date
        const today = new Date(formatDate(new Date()));
        const firstDateInSlot = new Date(existingData[0].schedule[0].showDate);
        const differenceInDates = Math.abs(today - firstDateInSlot);

        // Convert milliseconds to days
        var daysDifference = Math.ceil(differenceInDates / (1000 * 60 * 60 * 24));
        // console.log(today);
        // console.log(firstDateInSlot);
        // console.log(daysDifference);
        // Shift the data for each day and add a new entry for the upcoming day
        // console.log(existingData[0].schedule);
        for (let i = 0; i < 4; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const formattedDate = currentDate.toISOString().split('T')[0];
            const showDate_ = formatDate(currentDate);

            // Shift the data for each day
            if (i < 4 - daysDifference) {
                existingData[0].schedule[i].date = existingData[0].schedule[i + daysDifference].date;
                existingData[0].schedule[i].slots = existingData[0].schedule[i + daysDifference].slots.map(slot => ({ ...slot }));
                existingData[0].schedule[i].showDate = existingData[0].schedule[i + daysDifference].showDate;
            } else {
                // For the last day, add a new entry for the upcoming day
                existingData[0].schedule[i].date = currentDate;
                existingData[0].schedule[i].showDate = showDate_;
                existingData[0].schedule[i].slots.forEach(slot => {
                    slot.petrol = 0; // Reset petrol for the new day 
                    slot.diesel = 0; // Reset diesel for the new day
                });
            }
        }

        // Save the updated data back to MongoDB
        const updatedSchedule = existingData[0];
        // console.log(updatedSchedule);
        await ScheduleModel.findOneAndUpdate({}, updatedSchedule, { upsert: true });
        console.log('Data updated and saved to MongoDB.');
    } catch (error) {
        console.error('Error updating schedule:', error);
    }
}
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function createOrUpdateScheduleDao() {
    try {
        const existingSchedule = await ScheduleModel.findOne();

        if (!existingSchedule) {
            // Create the collection and insert default data
            const existingData = {
                "schedule": [
                    {
                        "day": "Day 1",
                        "slots": [
                            { "slot": 1, "time": "12-1 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 2, "time": "1-2 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 3, "time": "2-3 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 4, "time": "3-4 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 5, "time": "4-5 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 6, "time": "5-6 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 7, "time": "6-7 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 8, "time": "7-8 pm", "petrol": 0, "diesel": 0 }
                        ],
                        "showDate": "",
                        "date": "",
                    },
                    {
                        "day": "Day 2",
                        "slots": [
                            { "slot": 1, "time": "12-1 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 2, "time": "1-2 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 3, "time": "2-3 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 4, "time": "3-4 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 5, "time": "4-5 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 6, "time": "5-6 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 7, "time": "6-7 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 8, "time": "7-8 pm", "petrol": 0, "diesel": 0 }
                        ]
                    },
                    {
                        "day": "Day 3",
                        "slots": [
                            { "slot": 1, "time": "12-1 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 2, "time": "1-2 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 3, "time": "2-3 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 4, "time": "3-4 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 5, "time": "4-5 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 6, "time": "5-6 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 7, "time": "6-7 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 8, "time": "7-8 pm", "petrol": 0, "diesel": 0 }
                        ]
                    },
                    {
                        "day": "Day 4",
                        "slots": [
                            { "slot": 1, "time": "12-1 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 2, "time": "1-2 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 3, "time": "2-3 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 4, "time": "3-4 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 5, "time": "4-5 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 6, "time": "5-6 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 7, "time": "6-7 pm", "petrol": 0, "diesel": 0 },
                            { "slot": 8, "time": "7-8 pm", "petrol": 0, "diesel": 0 }
                        ]
                    }
                ]
            } // Replace with the actual path to your JSON file
            const today = new Date();

            // Generate the schedule for the next four days
            for (let i = 0; i < 4; i++) {
                const currentDate = new Date(today);
                currentDate.setDate(today.getDate() + i);

                const formattedDate = currentDate.toISOString().split('T')[0];
                // console.log(currentDate);
                // Update the schedule with the new day and date
                existingData.schedule[i].day = `Day ${i + 1}`;
                existingData.schedule[i].date = currentDate; // You can add a "date" field if needed
                existingData.schedule[i].showDate = formatDate(currentDate); // You can add a "date" field if needed
                // console.log(typeof (existingData.schedule[i].showDate));
                // Optionally, you can reset the orders for each slot
                existingData.schedule[i].slots.forEach(slot => {
                    slot.petrol = 0;
                    slot.diesel = 0;
                });
            }


            await ScheduleModel.create(existingData);
            console.log('Default schedule created in MongoDB.');
        } else {
            console.log('Schedule Already Existing in MongoDB.');
            // console.log(formatDate(existingSchedule.schedule[0].date));
            // console.log(formatDate(new Date()));
            if (formatDate(existingSchedule.schedule[0].date) != formatDate(new Date())) {
                log.info("schedule updating as date didnt matched")
                updatedScheduleDao();
            }

        }
    } catch (error) {
        console.error('Error creating or updating schedule:', error);
    }
}


module.exports = {
    getAllOrdersDao,
    paymentBeforeOrderDao,
    addOrderDao,
    updateOrderDetailsDao,
    updateOrderStatusDao,
    getaddressByIdDao,
    updatedScheduleDao,
    createOrUpdateScheduleDao
}