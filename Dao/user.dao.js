const Logger = require('../logger/logger');
const log = new Logger('User_Dao');
const { UserModel } = require('../models/user.schemaModel');
const axios = require('axios')




//I have included this for dev puprose wil remember to comment it out before testing and final deployment
// mongoose.connection.dropCollection('users', err => { if (err) log.error('Unable to drop user collections: ' + err) });


async function getByUsername(loginInfo, response) {
    const username = loginInfo;

    await UserModel.findOne({ username: username }, (err, res) => {
        if (err || !res) {
            log.error(`Error in finding user with username ${username}` + err);
            return response.status(404).send({
                username: username,
                message: 'No user with username ' + username
            });
        }
        else {
            log.info(`Foudn a user with data ${res.username}`);
            return response.status(200).send({
                // username: username,
                phoneNo: res.phoneNo,
                result: res,
                message: 'Found a user with username ' + username
            })
        }
    })
}

async function getaddressbyIdDao(loginInfo, res) {
    const _id = loginInfo;

    await UserModel.findOne({ 'address._id': _id }, async (err, response) => {
        if (err || !res) {
            log.error(`Error in finding user with ${_id}` + err);
            return res.status(404).send({
                username: _id,
                message: 'No user with ' + _id + 'found'
            });
        }
        else {
            let array = [];
            // console.log(response.address);s
            for (let i = 0; i < response.address.length; i++) {
                if (response.address[i]._id == _id) {
                    array.push(response.address[i]);
                    break;
                }
            }
            console.log(array);
            log.info(`Foudn a user with data ${_id}`);
            return res.status(200).send({
                statusCode: 200,
                // username: username,
                result: array,
                message: 'Found a user with ' + _id
            })
        }
    })
}

async function resgisterNewUser(userObj, response) {
    console.log({ userObj });
    // console.log(userObj.address[0]);
    const ind = userObj.address.length;
    console.log(ind, "array size");
    const phoneNo = userObj.phoneNo;
    console.log(phoneNo);

    // let newUser = new UserModel({
    //     name: userObj.name,
    //     username: userObj.username,
    //     phoneNo: userObj.phoneNo,
    //     address: [{
    //         name: userObj.address[ind - 1].name,
    //         phoneNo: userObj.address[ind - 1].phoneNo,
    //         myself: userObj.address[ind - 1].myself,
    //         saveas: userObj.address[ind - 1].saveas,
    //         fulladdr: userObj.address[ind - 1].fulladdr,
    //         vehicle: userObj.address[ind - 1].vehicle,
    //         vnumber: userObj.address[ind - 1].vnumber
    //     }]
    // });
    let newUser = new UserModel({
        name: '',
        username: '',
        phoneNo: userObj.phoneNo,
        address: []
    });
    console.log("bool check");

    const result = await newUser.save((err, result) => {
        if (err) {
            log.error(`Error in registering new user with username ${userObj.phoneNo}: ` + err);
            return response.status(202).send({
                messageCode: new String(err.errmsg).split(" ")[0],
                message: 'phoneNo ' + userObj.phoneNo + ' already exists.'
            });
        };
        log.info(result.phoneNo + ' has been registered');
        return response.status(200).send({
            message: 'You have been registered successfully.',
            phoneNo: result.phoneNo
        });
    });
    return result;
}

async function getByPhoneNo(phoneNo, res) {
    console.log({ phoneNo });
    await UserModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log("checkpoint3");
        if (err || !response) {
            log.error(`Error in finding phoneNo ${phoneNo}` + err);
            return res.status(404).send({
                statusCode: 404,
                phoneNo: phoneNo,
                message: 'No user Found!'
            })
        }
        else {
            log.info(`Found a user with phone No ${phoneNo}`);
            return res.status(200).send({
                statusCode: 200,
                result: response,
                message: ``
            })
        }
    })
}

async function getAddress(phoneNo, res) {
    return await UserModel.findOne({ phoneNo: phoneNo });
}

async function updateAddressDao(req, res) {
    const loginInfo = req.body
    const address = loginInfo.address;
    address.status = 'active';
    const phoneNo = req.phoneNo;
    const _id = loginInfo._id;
    // const phoneNo = loginInfo.phoneNo;
    const userExists = getAddress(phoneNo, res);
    if (userExists.address === null) {
        return res.status(404).send({
            message: 'no address found with this phone number'
        })
    }
    await UserModel.findOneAndUpdate({ phoneNo: phoneNo, 'address._id': _id }, { $set: { 'address.$': address } }, (err, response) => {
        if (err || !response) {
            log.error(`Error in retrieving the data for the phone number ${phoneNo}` + err);
            return res.status(400).send({
                message: 'Error in updating the address',
                phoneNo: phoneNo
            })
        }
        else {

            log.info(`Found and successfully updated the phoneNo for the user ${phoneNo} from prev address ${response.address} to new address ${address}`);
            return res.status(200).send({
                statusCode: 200,
                message: `Successfully the address from ${response.address} to new address ${address}`,
                result: response
            })
        }
    })
}

async function addAddressDao(req, res) {
    try {
        log.info("adding new address")
        const loginInfo = req.body;
        const phoneNo = req.phoneNo;
        const adr = loginInfo.address;
        adr.status = 'active';
        const payload = await getAddress(phoneNo, res);
        // const adrArray = payload.address;
        payload.address.push(adr);
        console.log(payload);
        const result = await UserModel.findOneAndUpdate(
            { phoneNo: phoneNo },
            { $set: { address: payload.address } }, // Update operation
            { upsert: true, new: true },
            (err, response) => {
                console.log("updatePoint");
                if (err || !response) {
                    log.error(`Error in adding address` + err);
                    return res.status(400).send({
                        message: 'Something Went Wrong'
                    })
                }
                else {
                    log.info(`Sucessfully added new addres in the addres array to phoneNo ${phoneNo}`);
                    // console.log(res);
                    const newAddress = response.address[response.address.length - 1]
                    // console.log(newAddress._id);
                    return res.status(200).send({
                        statusCode: 200,
                        message: 'Successfully added new address',
                        addressId: newAddress._id
                    })

                }
            })
        return result;
    } catch (error) {
        log.error("error while adding address");
        res.status(400).send({
            message: 'Something Went Wrong'
        })

    }
}

async function deleteAddressDao(req, res) {
    try {
        let phoneNo = req.phoneNo;
        let addressDel = req.body
        console.log("dao entered");
        console.log(phoneNo);
        const address_id = addressDel.address_id;
        console.log({ addressDel });
        let userExists = await getAddress(phoneNo);
        if (userExists == null) {
            log.info('cannot find any address with this number ' + phoneNo)
            return res.status(404).send({
                statusCode: 404,
                message: 'No User Found! '
            })
        }
        console.log({ userExists });
        let idFound = address_id;
        const result = await UserModel.updateOne(
            { phoneNo: phoneNo, "address._id": idFound },
            { $set: { "address.$.status": "inactive" } },
            (err, response) => {
                if (err || !response) {
                    log.error(`Error in removing the address` + err);
                    return res.status(404).send({
                        statusCode: 404,
                        message: `Error While Deleting`
                    })
                }
                log.info(`Successfully deleted the address from phoneNo ${phoneNo}'s addresses`);
                return res.status(200).send({
                    statusCode: 200,
                    message: 'Deleted Successfully'
                })
            }
        );
        return result;


    } catch (error) {
        log.error(" error in deleting the address in Dao");
        res.status(400).send({
            statusCode: 400,
            message: 'Something Went Wrong'
        })
    }
}
async function deleteAccountDao(req, res) {
    try {
        let phoneNo = req.phoneNo;
        let userExists = await getAddress(phoneNo);
        if (userExists == null) {
            log.info('cannot find any address with this number ' + phoneNo)
            return res.status(404).send({
                statusCode: 404,
                message: 'No User Found! '
            })
        }
        console.log({ userExists });
        const result = await UserModel.deleteOne({ phoneNo: phoneNo }, (err, response) => {
            if (err || !response) {
                log.error(`Error in removing the Acoount` + err);
                return res.status(404).send({
                    statusCode: 404,
                    message: `Error While Deleting`
                })
            }
            log.info(`Successfully deleted the Account for phoneNo ${phoneNo}`);
            return res.status(200).send({
                statusCode: 200,
                message: 'Account Deleted Successfully'
            })
        }
        );

        return result;


    } catch (error) {
        log.error(" error in deleting the address in Dao");
        res.status(400).send({
            statusCode: 400,
            message: 'Something Went Wrong'
        })
    }
}

async function updateUsernameDao(req, res) {
    // console.log({ loginInfo });
    const loginInfo = req.body;
    const phoneNo = req.phoneNo;
    const name = loginInfo.name;

    const result = await UserModel.findOneAndUpdate({ phoneNo: phoneNo }, { name: name },
        (err, response) => {
            if (err || !response) {
                log.error(`Error throw from querry while updating the name`)
                return res.status(404).send({
                    message: 'Error while updating the name'
                })
            }
            else {

                log.info(`Successfully updated the name`);
                return res.status(200).send({
                    statusCode: 200,
                    message: 'Successfully updated the name'
                })
            }
        }
    )
    return result;
}

async function updateUsernameDao(loginInfo, res) {
    const phoneNo = loginInfo.phoneNo;
    const username = loginInfo.username;
    const result = await UserModel.findOneAndUpdate({ phoneNo: phoneNo }, { username: username }, (error, response) => {
        console.log("querry point");
        if (error || !response) {
            log.error(`Error while updating the user details ` + error)
            return res.status(404).send({
                message: 'Error while updating the user details of phoneNo ' + phoneNo
            })
        }
        log.info(`Successfully updated the user details for phoneNo ${phoneNo}`);
        return res.status(200).send({
            statusCode: 200,
            message: `Updated the user details for the phoneNo ${phoneNo}`
        })
    })
    return result;
}

async function updatePhoneNo(loginInfo, res) {
    // const phoneNo = loginInfo.phoneNo;
    const PhoneNo = loginInfo.newPhoneNo;
    const countryCode = loginInfo.countryCode;
    console.log({ PhoneNo }, "moment of truth flag");
    try {

        await UserModel.findOne({ phoneNo: PhoneNo }, async (err, response) => {
            if (err || !response) {
                // send otp and verify

                axios({
                    method: 'POST',
                    mode: 'no-cors',
                    url: "http://localhost:3000/user/sendotp",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    data: {
                        "countryCode": countryCode,
                        "phoneNo": PhoneNo
                    }
                }).then(result => {
                    console.log(result);
                    log.info('Successfully sent an otp to the new phoneNo');
                    return res.status(200).send({
                        statusCode: 200,
                        message: 'Otp sent to new phone no'
                    })
                })
                    .catch(err => {
                        console.log(err);
                        return res.status(404).send({
                            message: 'error in sending otp'
                        })
                    });
            }
            else {
                return res.status(407).send({
                    message: 'User already exists with this New phone No' + PhoneNo
                })
            }
        })
    } catch (error) {
        return res.status(400).send({
            message: 'error while updating new phone number '
        })
    }
}
async function validateLoginUser(loginInfo, response) {
    const username = loginInfo.username;
    await UserModel.findOne({ username: username }, (err, result) => {
        if (err || !result) {
            log.error(`Error in finding user with username ${username}:` + err);
            return response.status(400).send({
                username: loginInfo.username,
                message: 'No user with username' + username
            });
        }
    });
}



module.exports = {
    resgisterNewUser,
    validateLoginUser,
    getByUsername,
    getByPhoneNo,
    updatePhoneNo,
    updateAddressDao,
    addAddressDao,
    updateUsernameDao,
    deleteAddressDao,
    updateUsernameDao,
    getaddressbyIdDao,
    deleteAccountDao
}