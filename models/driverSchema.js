const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Driver_SchemaModel');

const addDriversSchemaModel = {
    username: Joi.string().required().max(50),
    password: Joi.string().required().max(50),
    name: Joi.string().required().max(50),
    phoneNo: Joi.string().required().max(10),
    // assignedOrders: {
    //     _orderId: Joi.string(),
    // }
}

const getOrdersSchemaModel = {
    phoneNo: Joi.string()
}

const updateDriverSchemaModel = {
    _orderId: Joi.string().max(50)
}

const adminLoginSchemaModel = {
    username: Joi.string().required().max(50),
    password: Joi.string().required().max(50)
}
const SystemWorking = {
    status: Joi.boolean().required(),
}

const driverLoginSchemaModel = {
    username: Joi.string().required().max(50),
    password: Joi.string().required().max(50)
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
const mongoSystemStatus = new mongoose.Schema({
    status: Boolean
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
const SystemStatusModel = mongoose.model('System', mongoSystemStatus);

log.warn(`Driver Schema model created`);


module.exports = {
    addDriversSchemaModel,
    DriverModel,
    driverLoginSchemaModel,
    getOrdersSchemaModel,
    adminLoginSchemaModel,
    updateDriverSchemaModel,
    AdminModel,
    SystemStatusModel,
    SystemWorking
}