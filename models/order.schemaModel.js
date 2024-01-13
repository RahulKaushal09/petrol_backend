const Joi = require('joi');
const mongoose = require('mongoose');

const getAllOrdersSchemaModel = {
    phoneNo: Joi.string().min(10).max(10)
}

const addOrderSchemaModel = {
    phoneNo: Joi.string().max(10).min(10),
    order: Joi.array().items(
        Joi.object({
            fuelType: Joi.string(),
            fuelAmount: Joi.string(),
            emergency: Joi.boolean(),
            Date: Joi.date(),
            preferredTiming: Joi.string(),
            CoupanId: Joi.string(),
            addressId: Joi.string(),
            status: Joi.string(),
            assignedTo: Joi.string(),
            assignTiming: Joi.string()
        })
    )
};


const mongoOrderSchema = new mongoose.Schema({
    phoneNo: String,
    order: [{
        fuelType: String,
        fuelAmount: String,
        emergency: Boolean,
        Date: Date,
        preferredTiming: String,
        CoupanId: String,
        addressId: String,
        status: String,
        assignedTo: String,
        assignTiming: String
        // flag status
        // Assigned to?
        // assign timing
        //  
    }],
});






module.exports = {
    getAllOrdersSchemaModel,
    orderModel,
    addOrderSchemaModel
}