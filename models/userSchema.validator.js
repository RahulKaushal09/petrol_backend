const Joi = require('joi');
const userSchemaModel = require('./user.schemaModel');

const validateNewUserSchema = (newUser) => {
    console.log("checkpoint 1");
    return Joi.validate(newUser, userSchemaModel.registerInputUserSchemaModel);
}

const validateVerifyEmailOtpSchema = (loginInfo) => {
    return Joi.validate(loginInfo, userSchemaModel.verifyEmailOtpSchemaModel);
}

const validateLoginUserSchema = (user) => {
    return Joi.validate(user, userSchemaModel.loginSchemaModel);
}

const validateAddressDeleteSchema = (loginInfo) => {
    return Joi.validate(loginInfo, userSchemaModel.deleteAddressSchemaModel);
}

const validateUpdateNameSchema = (loginInfo) => {
    return Joi.validate(loginInfo, userSchemaModel.updateNameSchemaModel);
}

const validateUpdateDetailsSchema = (loginInfo) => {
    return Joi.validate(loginInfo, userSchemaModel.updateDetailsSchemaModel);
}

const userValidateEmailSendOtpSchema = (loginInfo) => {
    return Joi.validate(loginInfo, userSchemaModel.sendOtpEmailSchemaModel)
}

const validateGetUsernameSchema = (username) => {
    console.log("flag");
    return Joi.validate(username, userSchemaModel.getByUsernameSchema);
}

const ValidatorUpdatePhoneSchema = (payload) => {
    console.log("flagger");
    return Joi.validate(payload, userSchemaModel.updatePhoneSchemaModel);
}

const validateGetByPhoneNo = (phoneNo) => {
    console.log("Checkker");
    return Joi.validate(phoneNo, userSchemaModel.getByPhoneNoSchema);
}

const validateUpdateAddressSchema = (loginInfo) => {
    console.log("flagger");
    return Joi.validate(loginInfo, userSchemaModel.updateAddressSchemaModel);
}

const validateAddaddressSchema = (loginInfo) => {
    console.log("checkoint 2");
    return Joi.validate(loginInfo, userSchemaModel.addAddressSchemaModel);
}

const validateSendOtpSchema = (loginInfo) => {
    console.log("checkpoint 2");
    return Joi.validate(loginInfo, userSchemaModel.sendOtpSchemaModel);
}

const validateVerifyOtpSchema = (loginInfo) => {
    console.log("checkpoint 2");
    return Joi.validate(loginInfo, userSchemaModel.verifyOtpSchemaModel);
}

const validateVerifyUpdatePhoneNoSchema = (loginInfo) => {
    console.log("checkpoint 2");
    return Joi.validate(loginInfo, userSchemaModel.verifyUpdatePhoneNoSchemaModel);
}

module.exports = {
    validateNewUserSchema,
    validateLoginUserSchema,
    validateGetUsernameSchema,
    validateGetByPhoneNo,
    ValidatorUpdatePhoneSchema,
    validateUpdateAddressSchema,
    validateSendOtpSchema,
    validateVerifyOtpSchema,
    validateAddaddressSchema,
    userValidateEmailSendOtpSchema,
    validateUpdateDetailsSchema,
    validateAddressDeleteSchema,
    validateVerifyEmailOtpSchema,
    validateUpdateNameSchema,
    validateVerifyUpdatePhoneNoSchema
}