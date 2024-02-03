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
const { ScheduleModel } = require('../models/order.schemaModel');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '900gamingg@gmail.com',
        pass: 'szfn qduq ewoc xqmb'
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
const secretKey = "123456789";
// const secretKey = "apptesting"
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
async function getSchedule(req, res) {
    try {

        const fuelType = req.body.fuelType;
        // console.log(fuelType);
        if (fuelType != "petrol" && fuelType != "diesel") {
            return res.status(404).send({
                message: "Something Went Wrong",
                statusCode: 404
            })
        }



        await ScheduleModel.find({}, (err, response) => {
            console.log({ response });
            if (err || !response) {
                log.error(`error in get schedule controller `)
                return;
            }
            else {
                log.info("successfully entered schedule");
                const currentDate = new Date();

                const scheduleData = response[0].schedule.map(scheduleItem => {
                    const filteredSlots = (scheduleItem.slots || []).filter(slot => {
                        if (slot && scheduleItem.date && slot.time && slot.possibility !== 0) {
                            const fuelTypeValue = fuelType === 'petrol' ? slot.petrol : slot.diesel;

                            if (fuelTypeValue < 2) {
                                const slotDateTime = new Date(scheduleItem.date);
                                const [timeStart, timeEnd] = slot.time.split('-')[0].split(':').map(Number);
                                const hoursStart = timeStart % 12 + 12;
                                const currentDay = currentDate.getDate();
                                const currentHours = currentDate.getHours();

                                slotDateTime.setHours(hoursStart, 0);
                                const slotDay = slotDateTime.getDate();
                                let slotHours = slotDateTime.getHours();

                                if (currentDay == slotDay) {
                                    return (currentHours < slotHours);
                                } else {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }).map(filteredSlot => {
                        if (filteredSlot) {
                            return { ...filteredSlot.toObject() };
                        }
                        return filteredSlot;
                    });
                    if (filteredSlots.length > 0) {
                        return { ...scheduleItem.toObject(), slots: filteredSlots };
                    }
                    return null; // Exclude date if no available slots
                }).filter(scheduleItem => scheduleItem !== null);

                // return { ...scheduleItem.toObject(), slots: filteredSlots };
                // });

                // const scheduleData = response[0].schedule.map(scheduleItem => {
                //     const filteredSlots = (scheduleItem.slots || []).filter(slot => {
                //         if (slot && scheduleItem.date && slot.time && slot.possibility !== 0) {
                //             const slotDateTime = new Date(scheduleItem.date);
                //             const [timeStart, timeEnd] = slot.time.split('-')[0].split(':').map(Number);
                //             // console.log(timeStart);
                //             const hoursStart = timeStart % 12 + 12;
                //             const currentDay = currentDate.getDate();
                //             const currentHours = currentDate.getHours();

                //             // Extract date and hours from slotDateTime
                //             slotDateTime.setHours(hoursStart, 0);
                //             const slotDay = slotDateTime.getDate();
                //             let slotHours = slotDateTime.getHours();
                //             // slotHours = slotHours % 12 + slotHours;

                //             // Compare the date and hours
                //             if (currentDay == slotDay) {
                //                 console.log(slotHours);
                //                 return (currentHours < slotHours)
                //             }
                //             else {
                //                 return true
                //             }

                //             // slotDateTime.setHours(hours);
                //             // slotDateTime.setMinutes(minutes);
                //             // return currentDate.getTime() <= slotDateTime.getTime();
                //         }
                //         return false;
                //     }).map(filteredSlot => {
                //         if (filteredSlot) {
                //             return { ...filteredSlot.toObject() };
                //         }
                //         return filteredSlot;
                //     });

                //     return { ...scheduleItem.toObject(), slots: filteredSlots };
                // });

                return res.status(200).send({
                    statusCode: 200,
                    result: scheduleData
                });

            }
        })
    } catch (error) {
        log.error(`error while finding schedule ` + error)
        return res.status(420).send({
            message: "error while finding schedule "
        })
    }

}
async function verifyEmailOtp(req, res) {
    const loginInfo = req.body;



    const phoneNo = req.phoneNo;
    let boolFlag;
    let addressFlag = false;
    const temp = await UserModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log({ response });
        if (err || !response) {
            log.error(`Error while finding an already existing email with this phoneNo`)
            boolFlag = false;
            return;
        }
        if (response.address.length > 0) {
            addressFlag = true;
            return
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
        // const name = loginInfo.name;
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
                        statusCode: 500,
                        message: 'Something Went Wrong'
                    })
                }
                log.info(`Otp matched successfully`);
                await UserEmailModel.findOneAndDelete({
                    email: email,
                    emailOtp: otp
                })
                log.info(`Otp matched and deleted`);
                // update emaill name 
                await UserModel.findOneAndUpdate({ phoneNo: phoneNo }, { username: email }, (err, response) => {
                    if (err | !response) {
                        log.error(`Error in updating name and email`);
                        return res.status(500).send({
                            statusCode: 500,
                            message: 'Something Went Wrong'
                        })
                    }
                    else {
                        log.info(`Succesfully update name and email`)
                    }
                })
                return res.status(200).send({
                    statusCode: 200,
                    addressFlag: addressFlag,
                    message: 'Profile Updated'
                })
            })
            return existingData;
        } catch (error) {
            log.error(`Error in verifying email otp` + error)
            return res.status(400).send({
                statusCode: 400,
                message: "Error in verifying email otp"
            })
        }
    }
}
async function sendEmailOtp(req, res) {
    try {

        const loginInfo = req.body;
        let { error } = userValidator.userValidateEmailSendOtpSchema(loginInfo);
        if (isNotValidSchema(error, res)) return;
        if (loginInfo.username) {
            const name = loginInfo.name;
            const phoneNo = req.phoneNo;
            console.log(phoneNo);
            UserModel.findOneAndUpdate(
                { phoneNo: phoneNo },
                { $set: { name: name } },
                { new: true }, (error, info) => {
                    if (error) {
                        log.error("error while adding name ")
                        console.log(error);
                        return res.status(500).send({
                            statusCode: 500,
                            message: 'Something Went Wrong'
                        });
                    }
                    log.info("name updated in the db")
                }


            );
            const email = loginInfo.username;

            try {

                await UserEmailModel.findOneAndDelete({
                    email: email
                    // emailOtp: otp
                }, (err, response) => {
                    console.log({ response });
                    if (err || !response) {
                        log.info(`no email found ` + err);
                    }
                    else {
                        log.info(`Deleted the email and otp from db`)
                    }
                })
            } catch (error) {
                log.error(`No emails found`);

            }
            try {
                const emailOtp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
                var mailOptions = {
                    // from: 'testapp@gmail.com',
                    to: email,
                    subject: 'Email Verification OTP',
                    text: "This is your one time OTP for Email verification: "
                        + emailOtp
                };
                // console.log({ emailOtp });
                console.log("checkpoint 11");
                transporter.sendMail(mailOptions, async (error, info) => {

                    console.log(emailOtp);
                    if (error) {
                        console.log(error);
                        return res.status(500).send({
                            statusCode: 500,
                            message: 'Error sending OTP!!'
                        });
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
                                    statusCode: 500,
                                    message: 'Something Went Wrong'
                                })
                            }
                            else {
                                log.info(`otp sent to email succesfully`);
                                return res.status(200).send({
                                    statusCode: 200,
                                    message: `OTP sent to Email`
                                })

                            }
                        });
                    }
                });


            } catch (error) {
                console.log(`Error in sending the otp using twilio for username recipient ${email}`)
                return res.status(400).send({
                    statusCode: 400,
                })
            }
        }
        else {
            const name = loginInfo.name;
            const phoneNo = req.phoneNo;
            console.log(phoneNo);
            await UserModel.findOneAndUpdate(
                { phoneNo: phoneNo },
                { $set: { name: name } },
                { new: true }, // This option returns the updated document
                (err, updatedUser) => {
                    if (err) {
                        log.error("Error updating user:", err);
                        // Handle the error
                        return res.status(400).send({
                            statusCode: 400,
                            message: "Something Went Wrong"
                        })
                    } else {
                        console.log(updatedUser)
                        log.info("User updated successfully:", updatedUser);
                        return res.status(201).send({
                            statusCode: 201,
                            message: "Profile Updated"
                        })
                        // Do something with the updated user
                    }
                }
            );
        }
    } catch (error) {
        log.error("Error in sending email user:", err);

        return res.status(400).send({
            statusCode: 400,
            message: "Something Went Wrong"
        })
    }

}

async function sendOtpController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateSendOtpSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        // send otp service
        console.log(client);
        console.log(loginInfo);
        await client.verify.v2
            .services(verifySid)
            .verifications.create({
                to: `+${loginInfo.countryCode}${loginInfo.phoneNo}`,
                channel: 'sms',
            }, (error, result) => {
                if (error) {
                    log.error(`Error in sending the otp using twilio for phone No ${loginInfo.phoneNo}`)
                    return res.status(400).send({
                        message: 'Error in sending otp!',
                        statusCode: 400
                    })
                }
                else {
                    log.info(`Sucessfully sent the otp to phoneNo ${loginInfo.phoneNo}`);
                    res.status(200).send({
                        message: 'Otp Sent to phone Number ' + loginInfo.phoneNo,
                        result: result,
                        statusCode: 200
                    })
                }
            })
    } catch (error) {
        // error in sending the otp using twilio
        log.error(`Error in catch of sending the otp using twilio for phone No ${loginInfo.phoneNo}`)
        return res.status(400).send({
            message: 'Error in sending otp!',
            statusCode: 400
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
    const newPhoneNo = loginInfo.phoneNo;
    // const oldPhoneNo = loginInfo.oldPhoneNo;
    let { error } = userValidator.validateVerifyUpdatePhoneNoSchema(loginInfo);
    if (isNotValidSchema(error, res)) return;
    try {
        const token = req.header('x-auth-token');
        const payload_jwt = jwt.verify(token, secretKey);
        const oldPhoneNo = payload_jwt.phoneNo;
        const verifiedResponse = await client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: `${loginInfo.countryCode}${loginInfo.phoneNo}`, code: otp });

        console.log(oldPhoneNo);
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
                { phoneNo: newPhoneNo },
                (err, response) => {
                    if (err || !response) {
                        log.error(`Erro in updating phoen No!`);
                        return res.status(404).send({
                            message: 'Error in updating phone no'
                        })
                    }
                    else {
                        return res.status(200).send({
                            statusCode: 200,
                            message: 'Updated phoneNo Successfully'
                        })
                    }
                })
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

async function verifyOtpController(req, res) {
    const loginInfo = req.body;
    const otp = loginInfo.otp;
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
                    if (existingUser.address.length > 0) {
                        log.info(`address already exist! LoggedIn successfully`);
                        // console.log({ existingUser });
                        return res.status(201).send({
                            statusCode: 201,
                            message: 'You have successfully logged In',
                            token: jwtToken,
                            name: existingUser.name,
                            address: existingUser.address[0]
                            // result: existingUser
                        });
                    }
                    log.info(`User already found. Need to add Address`);
                    console.log({ existingUser });
                    return res.status(203).send({
                        statusCode: 203,
                        message: 'Please add Address',
                        token: jwtToken,
                        name: existingUser.name
                        // result: existingUser
                    });
                }
                else {
                    // redirect it to name and usernam waala screen
                    return res.status(200).send({
                        statusCode: 200,
                        message: 'OTP verified',
                        token: jwtToken

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
                            statusCode: 500,
                            message: 'Something Went Wrong'
                        })
                    }
                    log.info(`Successfully saved the phoneNo into the db`);
                    return res.status(200).send({
                        statusCode: 200,
                        message: 'OTP verified',
                        token: jwtToken
                    })
                })
                return result;
            }
            // console.log("new user creation point");
        }
        else {
            res.status(400).send({
                statusCode: 400,
                message: 'Wrong OTP Entered'
            })
        }

    } catch (error) {
        log.error(`Error in verifing the otp` + error);
        res.status(404).send({
            statusCode: 404,
            message: 'Something Went Wrong'
        })
    }
}

async function getByPhoneNoController(req, res) {
    // const loginInfo = req.params.phoneNo;
    // console.log(loginInfo);
    try {
        const token = req.header('x-auth-token');
        const payload_jwt = jwt.verify(token, secretKey);
        const phoneNo = payload_jwt.phoneNo;
        console.log("checkpoint2");
        const response = await userDao.getByPhoneNo(phoneNo, res);
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
        const result = await userDao.addAddressDao(req, res);
        return result;
    } catch (error) {
        log.error(`Error in adding new address ` + error)
        res.status(400).send({
            message: 'Error in adding new address' + error
        })
    }
}

async function addressDeleteController(req, res) {
    const loginInfo = req.body;
    let { error } = userValidator.validateAddressDeleteSchema(loginInfo, res);
    if (isNotValidSchema(error, res)) return;
    try {

        console.log("schema and validation check");
        const result = await userDao.deleteAddressDao(req, res);
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
        if (error.details[0].message == '"phoneNo" length must be at least 10 characters long') {
            res.status(400).send({
                message: "Phone No. must be of 10 Digits"
            });
        }
        else {
            res.status(400).send({
                message: error.details[0].message
            });
        }
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
    getSchedule,
    verifyUpdatePhoneController
};