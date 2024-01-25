const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Order_SchemaModel');


const getAllOrdersSchemaModel = {
    phoneNo: Joi.string().min(10).max(10)
}

const updateOrderSchemaModel = {
    phoneNo: Joi.string(),
    orderID: Joi.string(),
    status: Joi.string(),
    assignedTo: Joi.string(),
    assignTiming: Joi.string(),
}

const updateOrderStatusSchemaModel = {
    phoneNo: Joi.string().required().max(10),
    orderID: Joi.string().required().max(50),
    status: Joi.string().required().max(15)
}

const addOrderSchemaModel = {
    // phoneNo: Joi.string().max(10).min(10).required(),
    order: {
        fuelType: Joi.string().required(),
        fuelAmount: Joi.string().required(),
        emergency: Joi.boolean(),
        Date: Joi.date(),
        preferredTiming: Joi.string().required(),
        CoupanId: Joi.string(),
        addressId: Joi.string().required(),
        status: Joi.string().required(),
        assignedTo: Joi.string().required(),
        assignTiming: Joi.string().required(),
        // total amount after coupan
        // totalAmount: Joi.string().required()
    }
};


const mongoOrderSchema = new mongoose.Schema({
    phoneNo: String,
    order: [{
        fuelType: String,
        fuelAmount: String,
        emergency: Boolean,
        Date: Date,
        preferredTiming: String,
        CoupanId: String,
        addressId: String,
        status: String,
        assignedTo: String,
        assignTiming: String,
        totalAmount: String
        // flag status
        // Assigned to?
        // assign timing
        //  
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
    date: Date
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