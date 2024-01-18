const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Coupan_SchemaModel');

const addCoupanSchemaModel = {
    name: Joi.string(),
    // phoneNo: Joi.string(),
    code: Joi.string(),
    discount: Joi.string(),
    validTill: Joi.string(),
    limit: Joi.string()
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
    limit: String
});

const CoupanModel = mongoose.model('Coupan', mongoCoupanSchema);
log.success(`Coupan Schema model created`);


module.exports = {
    CoupanModel,
    addCoupanSchemaModel,
    getAllCoupanSchemaModel,
}