const Joi = require('joi');
const orderSchemaModel = require('./order.schemaModel');

const validateGetOrdersSchema = (loginInfo) => {
    return Joi.validate(loginInfo, orderSchemaModel.getAllOrdersSchemaModel);
}

const validateAddOrderSchema = (orderInfo) => {
    console.log("checkpoint 1");
    return Joi.validate(orderInfo, orderSchemaModel.addOrderSchemaModel);
}

module.exports = {
    validateGetOrdersSchema,
    validateAddOrderSchema
}