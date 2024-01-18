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
    phoneNo: Joi.string(),
    orderID: Joi.string(),
    status: Joi.string()
}

const addOrderSchemaModel = {
    phoneNo: Joi.string().max(10).min(10),
    order: {
        fuelType: Joi.string(),
        fuelAmount: Joi.string(),
        emergency: Joi.boolean(),
        Date: Joi.date(),
        preferredTiming: Joi.string(),
        CoupanId: Joi.string(),
        addressId: Joi.string(),
        status: Joi.string(),
        assignedTo: Joi.string(),
        assignTiming: Joi.string(),
        // total amount after coupan
        totalAmount: Joi.string()
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




const orderModel = mongoose.model('Order', mongoOrderSchema);
log.success(`order Schema model created`);

module.exports = {
    getAllOrdersSchemaModel,
    orderModel,
    addOrderSchemaModel,
    updateOrderSchemaModel,
    updateOrderStatusSchemaModel
}