const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Coupan_SchemaModel');

const editCoupanSchemaModel = {
    code: Joi.string().required().max(50),
    status: Joi.string().required().max(50)
}
const addCoupanSchemaModel = {
    name: Joi.string().required().max(50),
    // phoneNo: Joi.string().required().max(50),
    code: Joi.string().required().max(50),
    discount: Joi.string().required().max(50),
    validTill: Joi.string().required().max(50),
    limit: Joi.string().required().max(50),
    status: Joi.string().required().max(50)
}

const getAllCoupanSchemaModel = {
    // phoneNo: Joi.string()
}

const mongoCoupanSchema = new mongoose.Schema({
    name: String,
    // phoneNo: String,
    code: String,
    discount: String,
    validTill: String,
    limit: String,
    status: String
});

const CoupanModel = mongoose.model('Coupan', mongoCoupanSchema);
log.success(`Coupan Schema model created`);


module.exports = {
    CoupanModel,
    addCoupanSchemaModel,
    getAllCoupanSchemaModel,
    editCoupanSchemaModel
}