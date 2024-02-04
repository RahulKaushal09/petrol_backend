const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Order_SchemaModel');


const getAllOrdersSchemaModel = {
    phoneNo: Joi.string().min(10).max(10)
}

const updateOrderSchemaModel = {
    phoneNo: Joi.string().required().max(10),
    orderID: Joi.string().required().max(50),
    status: Joi.string().required().max(50),
    assignedTo: Joi.string().required().max(50),
    assignTiming: Joi.string().required().max(50),
}

const updateOrderStatusSchemaModel = {
    phoneNo: Joi.string().required().max(10),
    orderID: Joi.string().required().max(50),
    status: Joi.string().required().max(15)
}

const addOrderSchemaModel = {
    // phoneNo: Joi.string().max(10).min(10).required(),
    order: {
        name: Joi.string().required(),
        fuelType: Joi.string().required(),
        fuelAmount: Joi.string().required(),
        emergency: Joi.boolean().allow(''),
        fullTank: Joi.boolean().allow(''),
        Date: Joi.date(),
        preferredTiming: Joi.string().allow(''),
        CoupanId: Joi.string().allow(''),
        addressId: Joi.string().required(),
        status: Joi.string().required(),
        paymentMethod: Joi.string().required(),



        // total amount after coupan
        // totalAmount: Joi.string().required()
    }
};


const mongoOrderSchema = new mongoose.Schema({
    phoneNo: String,
    order: [{
        name: String,
        fuelType: String,
        fuelAmount: String,
        emergency: Boolean,
        fullTank: Boolean,
        Date: Date,
        preferredTiming: String,
        CoupanId: String,
        addressId: String,
        status: String,
        paymentMethod: String,
        paymentIntentId: String,
        totalAmount: Number

    }],
});


const slotSchema = new mongoose.Schema({
    slot: Number,
    time: String,
    petrol: Number,
    diesel: Number
});

// Define the schema for a day
const daySchema = new mongoose.Schema({
    day: String,
    slots: [slotSchema],
    date: Date,
    showDate: String
});

// Define the main schedule schema
const scheduleSchema = new mongoose.Schema({
    schedule: [daySchema]
});


const orderModel = mongoose.model('Order', mongoOrderSchema);
const ScheduleModel = mongoose.model('Schedule', scheduleSchema);

log.success(`order Schema model created`);

module.exports = {
    getAllOrdersSchemaModel,
    ScheduleModel,
    orderModel,
    addOrderSchemaModel,
    updateOrderSchemaModel,
    updateOrderStatusSchemaModel
}