const Joi = require('joi');
const mongoose = require('mongoose');

const mongoUserSchema = new mongoose.Schema({
    name: String,
    email: String,
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
const mongoEmailOtp = new mongoose.Schema({
    email: String,
    otp: String
});
const sendOtpSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required()
}

const verifyOtpSchemaModel = {
    phoneNo: Joi.string().required().min(10).max(10),
    countryCode: Joi.string().required(),
    OTP: Joi.string().required().min(6).max(6)
}

const UserEmailModel = mongoose.model('EmailOtp', mongoEmailOtp);
const UserModel = mongoose.model('User', mongoUserSchema);

module.exports = {
    UserModel,
    UserEmailModel,
    verifyOtpSchemaModel,
    sendOtpSchemaModel
}