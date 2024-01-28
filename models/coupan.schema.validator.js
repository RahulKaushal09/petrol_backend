const Joi = require('joi');
const coupanSchemaModel = require('./coupan.schemaModel');


const validateEditCoupanSchema = (coupanInfo) => {
    return Joi.validate(coupanInfo, coupanSchemaModel.editCoupanSchemaModel);
}
const validateFindCoupanSchema = (coupanInfo) => {
    return Joi.validate(coupanInfo, coupanSchemaModel.findCoupanSchemaModel);
}
const validateAddCoupanSchema = (coupanInfo) => {
    return Joi.validate(coupanInfo, coupanSchemaModel.addCoupanSchemaModel);
}

const validateGetAllCoupansSchema = (coupanInfo) => {
    return Joi.validate(coupanInfo, coupanSchemaModel.getAllCoupanSchemaModel);
}

module.exports = {
    validateAddCoupanSchema,
    validateGetAllCoupansSchema,
    validateFindCoupanSchema,
    validateEditCoupanSchema
}