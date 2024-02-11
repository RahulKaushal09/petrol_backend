const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Fuel_SchemaModel');

const addFuelSchemaModel = {
    // phoneNo: Joi.string(),
    petrol: Joi.number().required().max(10),
    diesel: Joi.number().required().max(10),
    premium: Joi.number().required().max(10)
}

const updateFuelSchemaModel = {
    // phoneNo: Joi.string(),
    petrol: Joi.string().required().max(10),
    diesel: Joi.string().required().max(10),
    premium: Joi.string().required().max(10)
}

const mongoFuelSchema = new mongoose.Schema({
    // phoneNo: String,
    petrol: String,
    diesel: String,
    premium: String
});

const FuelModel = mongoose.model('Fuel', mongoFuelSchema);
log.success(`Fuel Schema model created`);


module.exports = {
    FuelModel,
    addFuelSchemaModel,
    updateFuelSchemaModel,
}