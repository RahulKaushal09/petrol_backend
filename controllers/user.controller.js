const userValidator = require('../models/userSchema.validator');
const userDao = require('../Dao/user.dao');
const Logger = require('../logger/logger');
const log = new Logger('User_Controller');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const verifySid = process.env.verifySID;
const { UserModel, UserEmailModel } = require('../models/user.schemaModel')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '900gamingg@gmail.com',
        pass: 'xixp nbhw ilzu sxga'
    }
});
// const readline = require("readline");

async function registerNewUser(req, res) {
    let userObj = req.body;
    userObj.name = "";
    userObj.username = "";
    userObj.address = [];
    console.log(userObj);
    // {
    //     "name": "ayush bhai mehta",
    //     "username": "ayushbhaimehta@gmail.com",
    //     "phoneNo": "1234567890",
    //     "address": [
    //         {
    //             "name": "Ayush",
    //             "phoneNo": "1234567890",
    //             "myself": true,
    //             "saveas": "Home",
    //             "fulladdr": "123 bhaldarpura Sarafaward Jabalpur India",
    //             "vehicle": "Activa scoty",
    //             "vnumber": "1001"
    //         }
    //     ]
    // }
    let { error } = userValidator.validateNewUserSchema(userObj);
    if (isNotValidSchema(error, res)) return;
    console.log("entering dao");
    try {
        const response = await userDao.resgisterNewUser(userObj, res);
        return response;
    } catch (error) {
        log.error(`Error in registering new user with username ${userObj.username}: ` + error);
    }
}

const secretKey = "123456789"
// client.verify.v2
//     .services(verifySid)
//     .verifications.create({ to: "+917879038278", channel: "sms" })
//     .then((verification) => console.log(verification.status, "flagger"))
//     .then(() => {
//         readline.createInterface({
//             input: process.stdin,
//             output: process.stdout,
//         });
//         readline.question("Please enter the OTP:", (otpCode) => {
//             client.verify.v2
//                 .services(verifySid)
//                 .verificationChecks.create({ to: "+917879038278", code: otpCode })
//                 .then((verification_check) => console.log(verification_check.status))
//                 .then(() => readline.close());
//         });
//         // console.log({ readline });
//     });
async function existsEmail(req, res, boolFlag) {


}
async function verifyEmailOtp(req, res) {
    const loginInfo = req.body;
    const secretKey = "123456789";

    // const loginInfo = req.body;
    let payload;
    const token = req.header('x-auth-token');
    try {
        payload = jwt.verify(token, secretKey);
        console.log({ payload });
    } catch (error) {
        return res.status(400).send({
            message: "wrong token"
        })
    }

    const phoneNo = payload.phoneNo;
    let boolFlag;
    const temp = await UserModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log({ response });
        if (err || !response) {
            log.error(`Error while finding an already existing email with this phoneNo`)
            boolFlag = false;
            return;
        }
        if (response.username) {
            log.info(`found an existing email with this phoneNo`);
            boolFlag = true;
            return;
        }
        else {
            boolFlag = false;
            return;
        }
    })
    console.log({ temp }, { boolFlag });
    if (boolFlag == true) {
        return res.status(201).send({
            message: 'Already found a email with this phoneNo'
        })
    }
    else {
        // const loginInfo = req.body;
        const otp = loginInfo.emailOtp;
        const name = loginInfo.name;
        const email = loginInfo.email;
        let { error } = userValidator.validateVerifyEmailOtpSchema(loginInfo);
        if (isNotValidSchema(error, res)) return;
        try {
            const existingData = await UserEmailModel.findOne({
                email: email,
                emailOtp: otp
            }, async (err, response) => {
                console.log({ response });
                if (err || !response) {
                    log.error(`otp not matching ` + err);
                    return res.status(500).send({
                        message: 'wrong otp'
                    })
                }
                log.info(`Otp matched successfully`);
                await UserEmailModel.findOneAndDelete({
                    email: email,
                    emailOtp: otp
                })
                log.info(`Otp matched and deleted`);
                // update emaill name 
                await UserModel.findOneAndUpdate({ phoneNo: phoneNo }, { name: name, username: email }, (err, response) => {
                    if (err | !response) {
                        log.error(`Error in updating name and email`);
                        return;
                    }
                    else {
                        log.info(`Succesfully update name and email`)
                    }
                })
                return res.status(200).send({
                    message: 'Otp matched successfully and updated name and email'
                })
            })
            return existingData;
        } catch (error) {
            log.error(`Error in verifying email otp` + error)
        }
    }
}
async function sendEmailOtp(req, res) {

    const loginInfo = req.body;
    const email = loginInfo.username;
    let { error } = userValidator.userValidateEmailSendOtpSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        await UserEmailModel.findOneAndDelete({
            email: email
            // emailOtp: otp
        }, (err, response) => {
            console.log({ response });
            if (err || !response) {
                log.error(`no email found ` + err);
            }
            else {
                log.info(`Deleted the email and otp from db`)
            }
        })
    } catch (error) {
        log.error(`No emails found`);

    }
    try {
        const emailOtp = otpGenerator.generate(6, { digits: true });
        var mailOptions = {
            from: 'testapp@gmail.com',
            to: email,
            subject: 'otp verification petrol app',
            text: emailOtp
        };
        // console.log({ emailOtp });
        console.log("checkpoint 11");
        await transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                const newEmailVerification = new UserEmailModel({
                    email: email,
                    emailOtp: emailOtp,
                });
                await newEmailVerification.save((err, response) => {
                    if (err || !response) {
                        log.error(`Error in saving otp with email in db ` + err);
                        return res.status(500).send({
                            message: 'Error in saving otp with email in db'
                        })
                    }
                    log.info(`otp sent to email succesfully`);
                    return res.status(200).send({
                        message: `Successfully saved otp and email for verification`
                    })
                });
            }
        })

    } catch (error) {
        console.log(`Error in sending the otp using twilio for username recipient ${email}`)
        return res.status(400).send({})
    }
}

async function sendOtpController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateSendOtpSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        // send otp service
        console.log(client);
        const otpResponse = await client.verify.v2
            .services(verifySid)
            .verifications.create({
                to: `+${loginInfo.countryCode}${loginInfo.phoneNo}`,
                channel: 'sms',
            })
        console.log(otpResponse);
        log.info(`Sucessfully sent the otp to phoneNo ${loginInfo.phoneNo}`);
        res.status(200).send({
            message: 'Otp Sent to phoneNo' + loginInfo.phoneNo,
            result: otpResponse
        })
    } catch (error) {
        // error in sending the otp using twilio
        log.error(`Error in sending the otp using twilio for phone No ${loginInfo.phoneNo}`)
        return res.status(400).send({
            message: 'Error in sending otp!'
        })
    }
}

async function check(phoneNo) {
    return await UserModel.findOne({ phoneNo: phoneNo });
}

async function verifyUpdatePhoneController(req, res) {
    const loginInfo = req.body;
    console.log(req.header('x-auth-token'));

    const otp = loginInfo.OTP;
    const phoneNo = loginInfo.phoneNo;
    const oldPhoneNo = loginInfo.oldPhoneNo;
    let { error } = userValidator.validateVerifyUpdatePhoneNoSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        const verifiedResponse = await client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: `${loginInfo.countryCode}${loginInfo.phoneNo}`, code: otp });

        if (verifiedResponse.status === 'approved') {
            log.info(`Successfully verified`);
            // const user = await getUserRole(loginInfo.phoneNo, res);
            // console.log({ user }, "Important check");
            const jwtToken = jwt.sign(
                {
                    "phoneNo": loginInfo.phoneNo,
                    // "username": loginInfo.username,
                },
                secretKey,
                // { expiresIn: "90d" }
            );
            res.header('x-auth-token', jwtToken);
            await UserModel.findOneAndUpdate({ phoneNo: oldPhoneNo },
                { phoneNo: phoneNo },
                (err, response) => {
                    if (err || !response) {
                        log.error(`Erro in updating phoen No!`);
                        return res.status(404).send({
                            message: 'Error in updating phone no'
                        })
                    }
                    else {
                        return res.status(200).send({
                            message: 'Updated phoneNo Successfully'
                        })
                    }
                })
        }
    } catch (error) {
        log.error(`Error in verifing the otp` + error);
        res.status(404).send({
            message: 'Wrong otp'
        })
    }
}

async function verifyOtpController(req, res) {
    const loginInfo = req.body;
    const otp = loginInfo.OTP;
    const phoneNo = loginInfo.phoneNo;
    console.log({ loginInfo });
    let { error } = userValidator.validateVerifyOtpSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        const verifiedResponse = await client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: `${loginInfo.countryCode}${loginInfo.phoneNo}`, code: otp });
        // .create({ to: loginInfo.phoneNo, code: otp });
        // console.log(verifiedResponse, "abc");

        if (verifiedResponse.status === 'approved') {
            log.info(`Successfully verified`);
            // const user = await getUserRole(loginInfo.phoneNo, res);
            // console.log({ user }, "Important check");
            const jwtToken = jwt.sign(
                {
                    "phoneNo": loginInfo.phoneNo,
                    // "username": loginInfo.username,
                },
                secretKey,
                // { expiresIn: "90d" }
            );
            res.header('x-auth-token', jwtToken);

            const existingUser = await check(phoneNo);
            console.log({ existingUser });
            if (existingUser) {
                if (existingUser.name) {
                    // username may exits or it may not
                    log.info(`User already found. LoggedIn successfully`);
                    console.log({ existingUser });
                    return res.status(203).send({
                        message: 'You have successfully loggedIn',
                        // result: existingUser
                    });
                }
                else {
                    // redirect it to name and usernam waala screen
                    return res.status(200).send({
                        message: 'newUser',
                        // result: resposne
                    })
                }
            }
            else {
                // register
                let newUser = new UserModel({
                    name: '',
                    username: '',
                    phoneNo: phoneNo,
                    address: []
                });
                const result = await newUser.save((err, response) => {
                    if (err || !response) {
                        log.error(`Error in saving new phoneNo into the db ` + err);
                        return res.status(500).send({
                            message: 'Error in saving phoneNo'
                        })
                    }
                    log.info(`Successfully saved the phoneNo into the db`);
                    return res.status(200).send({
                        message: 'Phone no saved in the db!'
                    })
                })
                return result;
            }
            // console.log("new user creation point");
        }
        else {
            res.status(400).send({
                message: 'Wrong otp entered'
            })
        }

    } catch (error) {
        log.error(`Error in verifing the otp` + error);
        res.status(404).send({
            message: 'Wrong otp'
        })
    }
}

async function getByPhoneNoController(req, res) {
    const loginInfo = req.params.phoneno;
    console.log(loginInfo);
    try {
        console.log("checkpoint2");
        const response = await userDao.getByPhoneNo(loginInfo, res);
        return response;
    } catch (error) {
        log.error(`Error in getting userdata by this phone No ${loginInfo.phoneno}` + error);
    }
}

async function getByIdController(req, res) {
    const loginInfo = req.params.Id;
    try {
        const result = await userDao.getaddressbyIdDao(loginInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in getting userdata by this id ${loginInfo.Id}` + error);

    }
}

async function updateAddress(req, res) {
    const loginInfo = req.body;
    let { err } = userValidator.validateUpdateAddressSchema(loginInfo, res);
    if (isNotValidSchema(err, res)) return;
    try {
        console.log("checkpoint 2");
        const response = await userDao.updateAddressDao(loginInfo, res);
        // log.info(`Successfully updated the address`)
        return response;
    } catch (error) {
        log.error(`Error in finding the user` + error)
    }
}

async function addAdressController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateAddaddressSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        console.log("checkpoint 1");
        const result = await userDao.addAddressDao(loginInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in adding new address ` + error)
    }
}

async function addressDeleteController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateAddressDeleteSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        console.log("schema and validation check");
        const result = await userDao.deleteAddressDao(loginInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in deleting this address` + error);
        return res.status(500).send({
            message: 'Error in deleting this address'
        })
    }
}

async function updateUsernameController(req, res) {
    const loginInfo = req.body;
    console.log({ loginInfo });
    let { error } = userValidator.validateUpdateDetailsSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        console.log("validation and schema done");
        const result = await userDao.updateUsernameDao(loginInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in updating user details` + error);
        return res.status(500).send({
            message: 'Something went wrong with updating the user details'
        })
    }
}

async function updateNameController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateUpdateNameSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;

    try {
        const result = await userDao.updateUsernameDao(loginInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in controller while updating name` + error)
    }
}

async function updatePhoneController(req, res) {
    const loginInfo = req.body;
    console.log(loginInfo);
    let { error } = userValidator.ValidatorUpdatePhoneSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {
        console.log("checkpoint2");
        const response = await userDao.updatePhoneNo(loginInfo, res);
        return response;
    } catch (error) {
        log.error(`Error in getting data for phone number ${loginInfo.phoneNo}` + error)
    }
}

async function getByUsernameController(req, res) {
    console.log({ req });
    const loginInfo = req.params.username;
    console.log(loginInfo);

    try {
        const response = await userDao.getByUsername(loginInfo, res);
        return response;
    } catch (error) {
        log.error(`Error in getting userdata by this username${loginInfo.username} ` + error)
    }
}

function isNotValidSchema(error, res) {
    if (error) {
        log.error(`Schema validation error:${error.details[0].message}`);
        res.status(400).send({
            message: error.details[0].message
        });
        return true;
    }
    return false;
}

module.exports = {
    registerNewUser,
    getByUsernameController,
    getByPhoneNoController,
    updatePhoneController,
    updateAddress,
    sendOtpController,
    verifyOtpController,
    addAdressController,
    updateUsernameController,
    addressDeleteController,
    sendEmailOtp,
    verifyEmailOtp,
    updateNameController,
    getByIdController,
    verifyUpdatePhoneController
};