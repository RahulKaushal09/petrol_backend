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
    phoneNo: Joi.string(),
    address: {
        name: Joi.string(),
        phoneNo: Joi.string(),
        myself: Joi.boolean(),
        saveas: Joi.string(),
        fulladdr: Joi.string(),
        vehicle: Joi.string(),
        vnumber: Joi.string().max(4).min(4)
    }
}

const mongoEmailOtp = new mongoose.Schema({
    email: String,
    emailOtp: String
});

const verifyEmailOtpSchemaModel = {
    name: Joi.string().required(),
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
            vehicle: String,
            vnumber: String,
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
    phoneNo: Joi.string(),
    username: Joi.string().email(),
}

const updateNameSchemaModel = {
    name: Joi.string(),
    phoneNo: Joi.string()
}

const updatePhoneSchemaModel = {
    phoneNo: Joi.string().required().max(10).min(10),
    newPhoneNo: Joi.string().required().max(10).min(10)
}

const updateAddressSchemaModel = {
    phoneNo: Joi.string().required().max(10).min(10),
    address: {
        name: Joi.string(),
        phoneNo: Joi.string(),
        myself: Joi.boolean(),
        saveas: Joi.string(),
        fulladdr: Joi.string(),
        vehicle: Joi.string(),
        vnumber: Joi.string().max(4).min(4)
    }
}

const addAddressSchemaModel = {
    phoneNo: Joi.string().required().max(10).min(10),
    address: {
        name: Joi.string(),
        phoneNo: Joi.string(),
        myself: Joi.boolean(),
        saveas: Joi.string(),
        fulladdr: Joi.string(),
        vehicle: Joi.string(),
        vnumber: Joi.string().max(4).min(4)
    }
}

const sendOtpSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required(),
}

const sendOtpEmailSchemaModel = {
    username: Joi.string().email(),
}

const verifyOtpSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required(),
    OTP: Joi.string().required().min(6).max(6),
}

const verifyUpdatePhoneNoSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    oldPhoneNo: Joi.string().required(),
    countryCode: Joi.string().required(),
    OTP: Joi.string().required().min(6).max(6),
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