const Joi = require('joi');
const mongoose = require('mongoose');
const Logger = require('../logger/logger');
const log = new Logger('User_SchemaModel');
const bcrypt = require('bcrypt');

const registerInputUserSchemaModel = {
    name: Joi.string().allow(''),
    username: Joi.string().email().allow(''),
    phoneNo: Joi.string().max(15),
    address: Joi.array().items(
        Joi.object({
            name: Joi.string(),
            phoneNo: Joi.string(),
            myself: Joi.boolean(),
            saveas: Joi.string(),
            fulladdr: Joi.string(),
            vehicle: Joi.string(),
            vnumber: Joi.string().max(4).min(4)
        })
    )
}

const deleteAddressSchemaModel = {
    // phoneNo: Joi.string(),
    address_id: Joi.string().required().max(100)
}

const mongoEmailOtp = new mongoose.Schema({
    email: String,
    emailOtp: String
});

const verifyEmailOtpSchemaModel = {
    // name: Joi.string().required(),
    email: Joi.string().max(50).required(),
    emailOtp: Joi.string().max(6).required()
}

const mongoUserSchema = new mongoose.Schema({
    name: String,
    username: String,
    phoneNo: String,
    address: [
        {
            name: String,
            phoneNo: String,
            myself: Boolean,
            saveas: String,
            fulladdr: String,
            houseNo: String,
            area: String,
            landmarks: String,
            fulladdr: String,
            vehicle: String,
            vnumber: String,
            lat: Number,
            long: Number,
            status: String
        }
    ]
});

const loginSchemaModel = {
    username: Joi.string().email().required(),
    password: Joi.string().required()
}

const validateGetUsernameSchema = {
    username: Joi.string().email().required()
}

const getByPhoneNoSchema = {
    phoneNo: Joi.string().required().max(10).min(10)
}

const getByUsernameSchema = {
    username: Joi.string().email().required()
}

const updateDetailsSchemaModel = {
    // phoneNo: Joi.string(),
    username: Joi.string().email(),
}

const updateNameSchemaModel = {
    name: Joi.string(),
    phoneNo: Joi.string()
}

const updatePhoneSchemaModel = {
    // phoneNo: Joi.string().required().max(10).min(10),
    countryCode: Joi.string().required().max(5),
    newPhoneNo: Joi.string().required().max(10).min(10)
}

const updateAddressSchemaModel = {
    _id: Joi.string().required().max(50),
    address: {
        name: Joi.string().required().max(50),
        phoneNo: Joi.string().required().max(10),
        myself: Joi.boolean().required(),
        saveas: Joi.string().required().max(50),
        fulladdr: Joi.string().required().max(100),
        vehicle: Joi.string().required().max(50),
        vnumber: Joi.string().max(4).min(4).required(),
        lat: Joi.string().required().max(100),
        long: Joi.string().required().max(100),
        status: Joi.string().required().max(50)
    }
}

const addAddressSchemaModel = {
    address: {
        name: Joi.string().required().max(100),
        phoneNo: Joi.string().required().max(15),
        myself: Joi.boolean().required(),
        saveas: Joi.string().required().max(50),
        fulladdr: Joi.string().required().max(300),
        houseNo: Joi.string().required().max(50),
        area: Joi.string().required().max(100),
        landmarks: Joi.string().max(100).allow(''),
        vehicle: Joi.string().required().max(50),
        vnumber: Joi.string().max(4).min(4).required(),
        lat: Joi.number().required().min(- 90).max(90).precision(10),
        long: Joi.number().required().min(- 180).max(180).precision(10),
        status: Joi.string().max(50)
    }
}

const sendOtpSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required(),

}

const sendOtpEmailSchemaModel = {
    name: Joi.string().required().max(40),
    username: Joi.string().email().max(40),
}

const verifyOtpSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required(),
    otp: Joi.string().required().min(4).max(4),
}

const verifyUpdatePhoneNoSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    // oldPhoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required().max(5),
    otp: Joi.string().required().min(6).max(6),
}

mongoUserSchema.methods.encryptPassword = function () {
    return bcrypt.hashSync(this.password, 10, (err) => {
        if (err) {
            log.error('Unable to ecrypt password: ' + err);
        }
    });
}
const UserModel = mongoose.model('User', mongoUserSchema);
const UserEmailModel = mongoose.model('Email', mongoEmailOtp);

module.exports = {
    registerInputUserSchemaModel,
    mongoUserSchema,
    loginSchemaModel,
    validateGetUsernameSchema,
    getByUsernameSchema,
    getByPhoneNoSchema,
    updatePhoneSchemaModel,
    updateAddressSchemaModel,
    sendOtpSchemaModel,
    verifyOtpSchemaModel,
    UserModel,
    addAddressSchemaModel,
    sendOtpEmailSchemaModel,
    updateDetailsSchemaModel,
    deleteAddressSchemaModel,
    UserEmailModel,
    verifyEmailOtpSchemaModel,
    updateNameSchemaModel,
    verifyUpdatePhoneNoSchemaModel
}