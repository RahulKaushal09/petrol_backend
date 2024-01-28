const Logger = require('../logger/logger');
const log = new Logger('User_Dao');
const { orderModel } = require('../models/order.schemaModel')
const { UserModel } = require('../models/user.schemaModel');
const { ScheduleModel } = require('../models/order.schemaModel');
const { CoupanModel } = require('../models/coupan.schemaModel');
const { errorMonitor } = require('nodemailer/lib/xoauth2');
const { FuelModel } = require('../models/fuel.schemaModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const secretKey = "12345"

async function getAllOrdersDao(orderInfo, res) {
    const phoneNo = orderInfo.phoneNo;
    console.log({ phoneNo });
    await orderModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log("checkpoint3");
        if (err) {
            log.error(`Error in finding phoneNo ${phoneNo}` + err);
            return res.status(404).send({
                phoneNo: phoneNo,
                message: 'error in finding phone No ' + phoneNo
            })
        }
        else if (!response) {

            log.error(`no response in phoneNo ${phoneNo}`);
            return res.status(200).send({
                statusCode: 200,
                phoneNo: phoneNo,
                message: 'No order with this ' + phoneNo + ' number found'
            })
        }
        else {
            log.info(`Found a order with phone No ${phoneNo}`);
            return res.status(200).send({
                statusCode: 200,
                result: response,
                message: `Found a order with phoneno ${phoneNo}`
            })
        }

    })
}

async function getOrdersByIdDao(orderInfo, res) {
    // const _orderId = orderInfo._orderId;
    // console.log({ _orderId });

}

async function updateOrderStatusDao(orderInfo, res) {
    const status = orderInfo.status;
    const phoneNo = orderInfo.phoneNo;
    const orderID = orderInfo.orderID;
    const result = await orderModel.findOneAndUpdate(
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
                    message: 'Successfully updated order status'
                })
            }

        })
    return result;
}

async function updateOrderDetailsDao(orderInfo, res) {
    const phoneNo = orderInfo.phoneNo;
    const orderID = orderInfo.orderID;
    const status = orderInfo.status;
    const assignedTo = orderInfo.assignedTo;
    const assignTiming = orderInfo.assignTiming;
    console.log({ phoneNo }, { status }, { assignedTo }, { assignTiming });

    await orderModel.findOneAndUpdate(
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

async function addOrderDao(phone, orderInfo, res) {
    try {
        // console.log({ orderInfo });
        const payload = await phoneExists(phone);
        if (!payload) {
            return res.status(404).send({
                message: 'Cant find the user with phoneNo' + orderInfo.phoneNo
            })
        }

        const reqAdr = orderInfo.order.addressId;
        let Order = orderInfo.order;

        // ***********************************************************************************
        // checking for slot availability 

        const schedules = await ScheduleModel.find({});
        let foundDate = false;
        let availableSlot;
        for (let i = 0; i < 4; i++) {
            console.log(schedules[0].schedule[i].date.toISOString().split('T')[0]);
            if (schedules[0].schedule[i].date.toISOString().split('T')[0] == orderInfo.order.Date) {
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

            // Update the MongoDB document with the modified schedule
            // await ScheduleModel.findOneAndUpdate(
            //     { "schedule.date": orderInfo.order.Date },
            //     { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
            //     {
            //         arrayFilters: [
            //             { "outer.date": orderInfo.order.Date },
            //             { "inner.time": preferredSlot.time }
            //         ],
            //         new: true
            //     },
            //     (error, updatedDocument) => {
            //         if (error) {
            //             log.error('Error updating schedule:', error);
            //             // Handle the error as needed
            //         } else {
            //             log.info('Schedule updated successfully:', updatedDocument);
            //             // Continue with any additional logic if needed
            //         }
            //     }
            // );


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
                                                message: `Rate for fuel type ${fuelType} not found in database`
                                            });
                                        }
                                    } else {
                                        console.log(`Fuel type ${fuelType} not found in database`);
                                        return res.status(404).send({
                                            message: `Fuel type ${fuelType} not found in database`
                                        });
                                    }

                                    rate = parseInt(rate);

                                    const Amount = parseInt(orderInfo.order.fuelAmount) * rate;

                                    console.log(parseInt(orderInfo.order.fuelAmount));
                                    // console.log({ totalAmount });
                                    const discount = response.discount;
                                    const temp = parseInt(discount);
                                    // console.log(parseInt(orderInfo.order.fuelAmount));
                                    totalAmount = ((100 - temp) / 100) * parseInt(Amount);
                                    console.log({ totalAmount });
                                    let orderDetails = await orderModel.findOne({ phoneNo: phone });
                                    // console.log({ orderDetails });
                                    let index = 0;
                                    // console.log({ index });
                                    if (orderDetails) {
                                        index = orderDetails.order.length;
                                    }
                                    if (index === 0) {
                                        let newOrder = new orderModel({
                                            "phoneNo": phone,
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
                                                "assignTiming": orderInfo.order.assignTiming,
                                                "totalAmount": totalAmount
                                            }
                                        });
                                        // payment
                                        const result = await newOrder.save(async (err, result) => {
                                            if (err) {
                                                log.error(`Error in adding first order for phoneNo ${phone}: ` + err);
                                                return res.status(500).send({
                                                    message: 'phoneNo ' + phone + ' Error in saving first order.'
                                                });
                                            }
                                            else {
                                                await ScheduleModel.findOneAndUpdate(
                                                    { "schedule.date": orderInfo.order.Date },
                                                    { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                    {
                                                        arrayFilters: [
                                                            { "outer.date": orderInfo.order.Date },
                                                            { "inner.time": preferredSlot.time }
                                                        ],
                                                        new: true
                                                    },
                                                    (error, updatedDocument) => {
                                                        if (error) {
                                                            log.error('Error updating schedule:', error);
                                                            // Handle the error as needed
                                                        } else {
                                                            log.info('Schedule updated successfully:', updatedDocument);
                                                            // Continue with any additional logic if needed
                                                        }
                                                    }
                                                );
                                                log.info(result.phoneNo + ' has just ordered for the first time!');
                                                return res.status(200).send({
                                                    statusCode: 200,
                                                    message: 'Your first order is queued successfully.',
                                                    phoneNo: result.phoneNo
                                                });

                                            }
                                        });
                                        // console.log("11");
                                        return result;
                                    }
                                    else {
                                        // console.log(orderDetails.order, "aaaaa");
                                        Order = { ...Order, "totalAmount": totalAmount };
                                        console.log({ Order });
                                        const check = orderDetails.order;
                                        check.push(Order)
                                        // console.log({ check });
                                        const result = await orderModel.findOneAndUpdate({ phoneNo: phone }, { order: check }, { new: true, upsert: true }, async (err, response) => {
                                            console.log("updatePoint");
                                            if (err || !response) {
                                                console.log(response);
                                                log.error(`Error in adding new order` + err);
                                                return res.status(400).send({
                                                    message: 'Error in adding new order'
                                                })
                                            }
                                            else {
                                                await ScheduleModel.findOneAndUpdate(
                                                    { "schedule.date": orderInfo.order.Date },
                                                    { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                                    {
                                                        arrayFilters: [
                                                            { "outer.date": orderInfo.order.Date },
                                                            { "inner.time": preferredSlot.time }
                                                        ],
                                                        new: true
                                                    },
                                                    (error, updatedDocument) => {
                                                        if (error) {
                                                            log.error('Error updating schedule:', error);
                                                            // Handle the error as needed
                                                        } else {
                                                            log.info('Schedule updated successfully:', updatedDocument);
                                                            // Continue with any additional logic if needed
                                                        }
                                                    }
                                                );
                                                log.info(`Sucessfully added new order in the order array to phoneNo ${phone}`);
                                                return res.status(200).send({
                                                    statusCode: 200,
                                                    message: 'Successfully added new order',
                                                })

                                            }

                                        })
                                        return result;
                                    }
                                }
                            })




                        }
                    })
                }

                else {
                    // payment
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

                            rate = parseInt(rate);

                            const totalAmount = parseInt(orderInfo.order.fuelAmount) * rate;

                            console.log(parseInt(orderInfo.order.fuelAmount));
                            console.log({ totalAmount });
                            let orderDetails = await orderModel.findOne({ phoneNo: phone });
                            // console.log({ orderDetails });
                            let index = 0;
                            // console.log({ index });
                            if (orderDetails) {
                                index = orderDetails.order.length;
                            }
                            if (index === 0) {
                                let newOrder = new orderModel({
                                    "phoneNo": phone,
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
                                        "assignTiming": orderInfo.order.assignTiming,
                                        "totalAmount": totalAmount
                                    }
                                });
                                const result = await newOrder.save(async (err, result) => {
                                    if (err) {
                                        log.error(`Error in adding first order for phoneNo ${phone}: ` + err);
                                        return res.status(500).send({
                                            message: 'phoneNo ' + phone + ' Error in saving first order.'
                                        });
                                    }
                                    else {
                                        await ScheduleModel.findOneAndUpdate(
                                            { "schedule.date": orderInfo.order.Date },
                                            { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                            {
                                                arrayFilters: [
                                                    { "outer.date": orderInfo.order.Date },
                                                    { "inner.time": preferredSlot.time }
                                                ],
                                                new: true
                                            },
                                            (error, updatedDocument) => {
                                                if (error) {
                                                    log.error('Error updating schedule:', error);
                                                    // Handle the error as needed
                                                } else {
                                                    log.info('Schedule updated successfully:', updatedDocument);
                                                    // Continue with any additional logic if needed
                                                }
                                            }
                                        );

                                        log.info(result.phoneNo + ' has just ordered for the first time!');
                                        return res.status(200).send({
                                            statusCode: 200,
                                            message: 'Your first order is queued successfully.',
                                            phoneNo: result.phoneNo
                                        });

                                    }
                                });
                                // console.log("11");
                                return result;
                            }
                            else {
                                // console.log(orderDetails.order, "aaaaa");
                                Order = { ...Order, "totalAmount": totalAmount };
                                // console.log({ Order });
                                const check = orderDetails.order;
                                check.push(Order)
                                // console.log({ check });
                                const result = await orderModel.findOneAndUpdate({ phoneNo: phone }, { order: check }, { new: true, upsert: true }, async (err, response) => {
                                    console.log("updatePoint");
                                    if (err || !response) {
                                        console.log(response);
                                        log.error(`Error in adding new order` + err);
                                        return res.status(400).send({
                                            message: 'Error in adding new order'
                                        })
                                    }
                                    await ScheduleModel.findOneAndUpdate(
                                        { "schedule.date": orderInfo.order.Date },
                                        { $set: { "schedule.$[outer].slots.$[inner]": preferredSlot } },
                                        {
                                            arrayFilters: [
                                                { "outer.date": orderInfo.order.Date },
                                                { "inner.time": preferredSlot.time }
                                            ],
                                            new: true
                                        },
                                        (error, updatedDocument) => {
                                            if (error) {
                                                log.error('Error updating schedule:', error);
                                                // Handle the error as needed
                                            } else {
                                                log.info('Schedule updated successfully:', updatedDocument);
                                                // Continue with any additional logic if needed
                                            }
                                        }
                                    );

                                    log.info(`Sucessfully added new order in the order array to phoneNo ${phone}`);
                                    return res.status(200).send({
                                        statusCode: 200,
                                        message: 'Successfully added new order',
                                    })

                                })
                                return result;


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



async function updatedScheduleDao() {
    try {
        // Fetch the existing data from MongoDB
        const existingData = await ScheduleModel.find({}, '-_id -__v').sort({ date: 1 }).exec();

        if (existingData[0].schedule.length !== 4) {
            console.error('Error: Expected 4 days of data but found', existingData[0].schedule.length);
            return;
        }

        // Get today's date
        const today = new Date();

        // Shift the data for each day and add a new entry for the upcoming day
        for (let i = 0; i < 4; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const formattedDate = currentDate.toISOString().split('T')[0];

            console.log(formattedDate);
            // Shift the data for each day
            if (i < 3) {
                existingData[0].schedule[i].date = existingData[0].schedule[i + 1].date;
                existingData[0].schedule[i].slots = existingData[0].schedule[i + 1].slots.map(slot => ({ ...slot }));
            } else {
                // For the last day, add a new entry for the upcoming day
                existingData[0].schedule[i].date = formattedDate;
                existingData[0].schedule[i].slots.forEach(slot => {
                    slot.petrol = 0; // Reset petrol for the new day 
                    slot.diesel = 0; // Reset diesel for the new day
                });
            }
        }

        // Save the updated data back to MongoDB
        const updatedSchedule = existingData[0];
        await ScheduleModel.findOneAndUpdate({}, updatedSchedule, { upsert: true });
        console.log('Data updated and saved to MongoDB.');
    } catch (error) {
        console.error('Error updating schedule:', error);
    }
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
                        ]
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

                // Update the schedule with the new day and date
                existingData.schedule[i].day = `Day ${i + 1}`;
                existingData.schedule[i].date = formattedDate; // You can add a "date" field if needed

                // Optionally, you can reset the orders for each slot
                existingData.schedule[i].slots.forEach(slot => {
                    slot.petrol = 0;
                    slot.diesel = 0;
                });
            }


            await ScheduleModel.create(existingData);
            console.log('Default schedule created in MongoDB.');
        } else {
            console.log('Schedule collection already exists in MongoDB.');
            if (existingSchedule.schedule[0].date.toISOString().split('T')[0] != new Date().toISOString().split('T')[0]) {
                updatedScheduleDao();
            }

        }
    } catch (error) {
        console.error('Error creating or updating schedule:', error);
    }
}


module.exports = {
    getAllOrdersDao,
    addOrderDao,
    updateOrderDetailsDao,
    updateOrderStatusDao,
    getOrdersByIdDao,
    updatedScheduleDao,
    createOrUpdateScheduleDao
}