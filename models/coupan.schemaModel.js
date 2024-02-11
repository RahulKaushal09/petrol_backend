const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('Coupan_SchemaModel');

const editCoupanSchemaModel = {
    code: Joi.string().required().max(50),
    status: Joi.boolean().required()
}
const findCoupanSchemaModel = {

    code: Joi.string().required().max(50),
    order: {
        fuelType: Joi.string().required(),
        fuelAmount: Joi.string().required(),
        isEmergency: Joi.boolean().allow()

    }


}
const addCoupanSchemaModel = {
    name: Joi.string().required().max(50),
    code: Joi.string().required().max(50),
    discount: Joi.number().required(),
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
    // validTill: String,
    // limit: String,
    status: Boolean
});

const CoupanModel = mongoose.model('Coupan', mongoCoupanSchema);
log.success(`Coupan Schema model created`);


module.exports = {
    CoupanModel,
    addCoupanSchemaModel,
    getAllCoupanSchemaModel,
    findCoupanSchemaModel,
    editCoupanSchemaModel
}