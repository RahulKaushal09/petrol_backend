const Joi = require('joi');
const coupanSchemaModel = require('./coupan.schemaModel');

const validateAddCoupanSchema = (coupanInfo) => {
    return Joi.validate(coupanInfo, coupanSchemaModel.addCoupanSchemaModel);
}

const validateGetAllCoupansSchema = (coupanInfo) => {
    return Joi.validate(coupanInfo, coupanSchemaModel.getAllCoupanSchemaModel);
}

module.exports = {
    validateAddCoupanSchema,
    validateGetAllCoupansSchema
}