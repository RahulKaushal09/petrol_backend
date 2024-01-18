const Joi = require('joi');
const orderSchemaModel = require('./order.schemaModel');

const validateGetOrdersSchema = (loginInfo) => {
    return Joi.validate(loginInfo, orderSchemaModel.getAllOrdersSchemaModel);
}

const validateAddOrderSchema = (orderInfo) => {
    console.log("checkpoint 1");
    return Joi.validate(orderInfo, orderSchemaModel.addOrderSchemaModel);
}

const validateUpdateOrderSchema = (orderInfo) => {
    console.log("checkpoint for validator");
    return Joi.validate(orderInfo, orderSchemaModel.updateOrderSchemaModel);
}

const validateUpdateOrderStatusSchema = (orderInfo) => {
    return Joi.validate(orderInfo, orderSchemaModel.updateOrderStatusSchemaModel);
}

module.exports = {
    validateGetOrdersSchema,
    validateAddOrderSchema,
    validateUpdateOrderSchema,
    validateUpdateOrderStatusSchema
}