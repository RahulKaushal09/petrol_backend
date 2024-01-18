const Joi = require('joi');
const fuelSchemaModel = require('./fuel.schemaModel');

const validateFuelSchema = (fuelInfo) => {
    return Joi.validate(fuelInfo, fuelSchemaModel.addFuelSchemaModel);
}

const validateUpdateFuelSchema = (fuelInfo) => {
    return Joi.validate(fuelInfo, fuelSchemaModel.updateFuelSchemaModel);
}

module.exports = {
    validateFuelSchema,
    validateUpdateFuelSchema
}

validateFuelSchema