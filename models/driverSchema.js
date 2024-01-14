const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Driver_SchemaModel');

const addDriversSchemaModel = {
    name: Joi.string(),
    assignedOrders: [
        _id1,
        _id2,
        _id3,
        _id4
        //orderIDs
    ],
    earned: Joi.string(),
    workedTime: Joi.string()
}

const mongoDriverSchema = new mongoose.Schema({
    name: String,
    assignedOrders: [
        {
            _orderId: String,
        }
        //orderIDs
    ],
    earned: String,
    workedTime: String
});

const DriverModel = mongoose.model('Driver', mongoDriverSchema);
log.warn(`Driver Schema model created`);


module.exports = {
    addDriversSchemaModel,
    DriverModel
}