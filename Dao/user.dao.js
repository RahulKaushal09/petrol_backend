const Logger = require('../logger/logger');
const log = new Logger('User_Dao');
const { UserModel } = require('../models/user.schemaModel');
const axios = require('axios')


const secretKey = "12345"

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

async function getByPhoneNo(loginInfo, res) {
    const phoneNo = loginInfo;
    console.log({ phoneNo });
    await UserModel.findOne({ phoneNo: phoneNo }, (err, response) => {
        console.log("checkpoint3");
        if (err || !response) {
            log.error(`Error in finding phoneNo ${phoneNo}` + err);
            return res.status(404).send({
                phoneNo: phoneNo,
                message: 'No user with this ' + phoneNo + 'found'
            })
        }
        log.info(`Found a user with phone No ${phoneNo}`);
        return res.status(200).send({
            result: response,
            message: `FOund a user with phoneno ${phoneNo}`
        })
    })
}

async function getAddress(phoneNo, res) {
    return await UserModel.findOne({ phoneNo: phoneNo });
}

async function updateAddressDao(loginInfo, res) {
    const address = loginInfo.address;
    const phoneNo = loginInfo.phoneNo;

    await UserModel.findOneAndUpdate({ phoneNo: phoneNo }, { address, address }, (err, response) => {
        if (err || !response) {
            log.error(`Error in retrieving the data for the username ${username}` + err);
            return res.status(400).send({
                message: 'Error in updating the address',
                phoneNo: phoneNo
            })
        }
        log.info(`Found and successfully updated the phoneNo for the user ${phoneNo} from prev address ${response.address} to new address ${address}`);
        return res.status(200).send({
            message: `Successfully the address from ${response.address} to new address ${address}`,
            result: response
        })
    })
}

async function addAddressDao(loginInfo, res) {
    const phoneNo = loginInfo.phoneNo;
    const adr = loginInfo.address;
    const payload = await getAddress(phoneNo, res);
    // const adrArray = payload.address;
    payload.address.push(adr);
    console.log(payload);
    const result = await UserModel.findOneAndUpdate(
        { phoneNo: phoneNo },
        { address: payload.address },
        (err, response) => {
            console.log("updatePoint");
            if (err || !response) {
                log.error(`Error in adding address` + err);
                return res.status(400).send({
                    message: 'Error in adding new address'
                })
            }
            log.info(`Sucessfully added new addres in the addres array to phoneNo ${phoneNo}`);
            // console.log(res);
            return res.status(200).send({
                message: 'Successfully added new address',
            })
        })
    return result;
}

async function deleteAddressDao(loginInfo, res) {
    console.log("dao entered");
    // store in a variable phoneno and address
    // check for phoneNo
    // check for address in that array
    // matching address id found 
    // mongo querry for update and delete
    // return the result
    const phoneNo = loginInfo.phoneNo;
    const addressDel = loginInfo.address;
    console.log({ addressDel });
    let flag = false;
    let userExists = await getAddress(phoneNo);
    console.log({ userExists });
    let idFound;

    for (let i = 0; i < userExists.address.length; i++) {
        if (userExists.address[i].name === addressDel.name &&
            userExists.address[i].phoneNo === addressDel.phoneNo &&
            userExists.address[i].myself === addressDel.myself &&
            userExists.address[i].saveas === addressDel.saveas &&
            userExists.address[i].fulladdr === addressDel.fulladdr &&
            userExists.address[i].vehicle === addressDel.vehicle &&
            userExists.address[i].vnumber === addressDel.vnumber
        ) {
            flag = true;
            idFound = userExists.address[i]._id;
            break;
        }
        console.log(userExists.address[i], "abbbbc");
        // console.log(i);
    }
    if (flag === false) {
        log.error(`Cannot find an address you entered ${addressDel}`);
        return res.status(404).send({
            message: 'Error in finding the given address'
        })
    }

    // const result = await UserModel.findOneAndDelete({ phoneNo: phoneNo }, {
    //     address: [{
    //         _id: idFound
    //     }]
    // })
    const result = await UserModel.updateOne({ phoneNo: phoneNo },
        { $pull: { address: { _id: idFound } } },
        (err, response) => {
            if (err || !response) {
                log.error(`Error in removing the address` + err);
                return res.status(404).send({
                    message: `Error in removing the address`
                })
            }
            log.info(`Successfully deleted the address from phoneNo ${phoneNo}'s addresses`);
            return res.status(200).send({
                message: 'Successfully deleted the address'
            })
        }
    );
    return result;
    // return res.status(200).send({ message: 'testing phase' })
}

async function updateUsernameDao(loginInfo, res) {
    console.log({ loginInfo });
    const phoneNo = loginInfo.phoneNo;
    const name = loginInfo.name;

    const result = await UserModel.findOneAndUpdate({ phoneNo: phoneNo }, { name: name },
        (err, response) => {
            if (err || !response) {
                log.error(`Error throw from querry while updating the name`)
                return res.status(404).send({
                    message: 'Error while updating the name'
                })
            }
            log.info(`Successfully updated the name`);
            return res.status(200).send({
                message: 'Successfully updated the name'
            })
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
            message: `Updated the user details for the phoneNo ${phoneNo}`
        })
    })
    return result;
}

async function updatePhoneNo(loginInfo, res) {
    const phoneNo = loginInfo.phoneNo;
    const newPhoneNo = loginInfo.newPhoneNo;
    console.log({ phoneNo }, "moment of truth flag");
    await UserModel.findOne({ phoneNo: newPhoneNo }, (err, response) => {
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
                    "countryCode": "+91",
                    "phoneNo": newPhoneNo
                }
            }).then(result => {
                console.log(result);
                log.info('Successfully sent an otp to the new phoneNo');
                return res.status(200).send({
                    message: 'Otp sent to new phoen no'
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
                message: 'User already exists with this phone No'
            })
        }
    })
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
    getaddressbyIdDao
}