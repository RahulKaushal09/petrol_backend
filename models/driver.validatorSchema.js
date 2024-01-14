const Joi = require('joi');
const driverSchemaModel = require('./coupan.schemaModel');

const validateAddDriversSchema = (driverinfo) => {
    return Joi.validate(driverinfo, driverSchemaModel.addDriversSchemaModel);
}

module.exports = {
    validateAddDriversSchema,
}