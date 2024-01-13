const express = require('express');
const userValidator = require('../models/userSchema.validator');

const { UserModel, UserEmailModel } = require('../models/user.schemaModel')
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator')
// uday sid for twilio
const accountSid = "AC9b6a5b9cf553e55bd6e1dbbf0766ad51";
const authToken = "a58e004dc657bf1a9f0d7c2c1c45b179";
const verifySid = "VAee6bdc998bc3a46f1e0d073adb2b4346";
const client = require("twilio")(accountSid, authToken);
const secretKey = "123456789"


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '900gamingg@gmail.com',
        pass: 'xixp nbhw ilzu sxga'
    }
});

function isNotValidSchema(error, res) {
    if (error) {
        console.log(`Schema validation error:${error.details[0].message}`);
        res.status(400).send({
            message: error.details[0].message
        });
        return true;
    }
    return false;
}
async function getUserRole(phoneNo, res) {
    return await UserModel.findOne({ phoneNo: phoneNo })
}
async function getUserByEmail(email, res) {
    return await UserEmailModel.findOne({ email: email })
}


async function sendOtpController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateSendOtpSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        // send otp service

        const otpResponse = await client.verify.v2
            .services(verifySid)
            .verifications.create({
                to: `+${loginInfo.countryCode}${loginInfo.phoneNo}`,
                channel: 'sms',
            })
        console.log(otpResponse);

        console.log(`Sucessfully sent the otp to phoneNo ${loginInfo.phoneNo}`);
        res.status(200).send({
            message: 'Otp Sent to phoneNo' + loginInfo.phoneNo,
            result: otpResponse
        })
    } catch (error) {
        // error in sending the otp using twilio
        console.log(`Error in sending the otp using twilio for phone No ${loginInfo.phoneNo}`)
    }
}

async function verifyOtpController(req, res) {
    const loginInfo = req.body;
    const otp = loginInfo.OTP;
    console.log({ loginInfo });
    let { error } = userValidator.validateVerifyOtpSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        const verifiedResponse = await client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: `${loginInfo.countryCode}${loginInfo.phoneNo}`, code: otp });
        console.log(verifiedResponse, "abc");
        if (verifiedResponse.status === 'approved') {
            console.log(`Successfully verified`);

            // Check if the phone number exists in MongoDB
            const user = await getUserRole(loginInfo.phoneNo);

            if (user) {
                // If the phone number exists, check the name field
                if (user.name) {
                    res.status(200).send({
                        message: 'Otp verified and person already exist with name: ' + user.name,
                        phoneNo: loginInfo.phoneNo,
                        name: user.name
                    });
                } else {
                    res.status(200).send({
                        message: 'Otp verified but name not found'
                    });
                }
            }
            else {
                // If the phone number does not exist in MongoDB
                let newUser = new UserModel({
                    phoneNo: loginInfo.phoneNo,
                });


                const result = await newUser.save((err, result) => {
                    if (err) {
                        console.log(`Error in registering new user with username ${loginInfo.phoneNo}: ` + err);
                        return response.status(202).send({
                            messageCode: new String(err.errmsg).split(" ")[0],
                            message: 'phoneNo ' + loginInfo.phoneNo + ' already exists.'
                        });
                    };
                    console.log(result.phoneNo + ' has been registered');
                    const jwtToken = jwt.sign(
                        {
                            "phoneNo": loginInfo.phoneNo,
                        }, secretKey);
                    // console.log(jwtToken)
                    res.header('x-auth-token', jwtToken).status(200).send({
                        message: 'Otp verified. You have been registered successfully with phone number.',
                        phoneNo: loginInfo.phoneNo
                    })

                });


            }
        } else {
            res.status(400).send({
                message: 'Wrong otp entered'
            });
        }
    } catch (error) {
        console.log(`Error in verifying the otp` + error);
        res.status(404).send({
            message: 'Wrong otp'
        });
    }
}
async function sendEmailOtp(req, res) {

    const loginInfo = req.body;
    const email = loginInfo.email;
    // let { error } = userValidator.userValidateEmailSendOtpSchema(loginInfo);
    // if (isNotValidSchema(error, res)) return;
    try {
        const emailOtp = otpGenerator.generate(6, { digits: true });

        var mailOptions = {
            from: 'testapp@gmail.com',
            to: email,
            subject: 'otp verification petrol app',
            text: emailOtp
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
        const newEmailVerification = new UserEmailModel({
            email: email,
            emailOtp: emailOtp,
        });
        newEmailVerification.save();

        res.header('emailOtp', emailOtp).status(200).send({
            message: 'email otp send in headers',
        })
            ;

    } catch (error) {
        console.log(`Error in sending the otp using twilio for username recipient ${email}`)
        return res.status
    }
}

async function registerDetails(req, res) {
    const token = req.header('otp');
    const loginInfo = req.body;
    const name = loginInfo.name;
    const email = loginInfo.email;
    const otp = loginInfo.emailOtp;

}
module.exports = {

    verifyOtpController,
    sendOtpController,
    registerDetails,
    sendEmailOtp

};
