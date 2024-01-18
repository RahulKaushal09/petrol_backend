const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Driver_SchemaModel');

const addDriversSchemaModel = {
    username: Joi.string(),
    password: Joi.string(),
    name: Joi.string(),
    phoneNo: Joi.string(),
    // assignedOrders: {
    //     _orderId: Joi.string(),
    // }
}

const getOrdersSchemaModel = {
    phoneNo: Joi.string()
}

const updateDriverSchemaModel = {
    phoneNo: Joi.string(),
    _orderId: Joi.string()
}

const adminLoginSchemaModel = {
    username: Joi.string(),
    password: Joi.string()
}

const driverLoginSchemaModel = {
    username: Joi.string(),
    password: Joi.string()
}

const mongoDriverSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    phoneNo: String,
    // assignedOrders: [
    //     {
    //         _orderId: String,
    //     }
    //     //orderIDs
    // ],
    role: String
});

const mongoAdminSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    phoneNo: String,
    role: String
});

const DriverModel = mongoose.model('Driver', mongoDriverSchema);
const AdminModel = mongoose.model('Admin', mongoAdminSchema);

log.warn(`Driver Schema model created`);


module.exports = {
    addDriversSchemaModel,
    DriverModel,
    driverLoginSchemaModel,
    getOrdersSchemaModel,
    adminLoginSchemaModel,
    updateDriverSchemaModel,
    AdminModel
}