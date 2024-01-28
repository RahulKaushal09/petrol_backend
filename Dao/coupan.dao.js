const Logger = require('../logger/logger');
const log = new Logger('Coupan_Dao');
// const { orderModel } = require('../models/order.schemaModel')
// const { UserModel } = require('../models/user.schemaModel')
const { CoupanModel } = require('../models/coupan.schemaModel');
const { FuelModel } = require('../models/fuel.schemaModel');

const secretKey = "12345"

async function findCoupanByCode(coupanInfo, res) {
    try {

        log.success('dao layer entered');
        console.log({ coupanInfo });

        return await CoupanModel.findOne({ code: coupanInfo.code, status: "false" }, async (err, response) => {
            log.success('dao querry layer entered');
            if (err || !response) {
                log.error(`failed in the query in dao layer ` + err);
                return res.status(404).send({
                    message: 'Cannot find any coupans '
                })
            }
            else {
                console.log(response);
                await FuelModel.find({}, async (e, fuelRates) => {
                    if (e || !fuelRates) {
                        // console.log(r);
                        log.error(`Error in finding fuel value` + e);
                        return res.status(400).send({
                            message: 'Error in finding fuel value'
                        })
                    }
                    else {
                        log.info(` fuel value entered`);
                        const fuelType = coupanInfo.order.fuelType;
                        // Find the matching fuel rate based on fuelType
                        const matchingFuel = fuelRates[0]; // Assuming there is only one document in the result
                        let rate;
                        console.log(fuelRates);
                        if (matchingFuel) {
                            // Access the rate of the matching fuel type using matchingFuel[fuelType]
                            rate = matchingFuel[fuelType.toLowerCase()];

                            if (rate) {
                                console.log(`Fuel rate for ${fuelType}: ${rate}`);
                                // return res.send("ok");
                            } else {
                                console.log(`Rate for fuel type ${fuelType} not found in database`);
                                return res.status(404).send({
                                    message: `Rate for fuel type ${fuelType} not found in database`
                                });
                            }
                        } else {
                            console.log(`Fuel type ${fuelType} not found in database`);
                            return res.status(404).send({
                                message: `Fuel type ${fuelType} not found in database`
                            });
                        }

                        rate = parseInt(rate);

                        const Amount = parseInt(coupanInfo.order.fuelAmount) * rate;

                        console.log(parseInt(coupanInfo.order.fuelAmount));
                        // console.log({ totalAmount });
                        const discount = response.discount;
                        const temp = parseInt(discount);
                        console.log(response);
                        // console.log(parseInt(orderInfo.order.fuelAmount));
                        totalAmount = ((100 - temp) / 100) * parseInt(Amount);
                        console.log({ totalAmount });
                        // const discount = response.discount;
                        // const temp = parseInt(discount);
                        // console.log(parseInt(coupanInfo.order.fuelAmount));
                        // totalAmount = ((100 - temp) / 100) * parseInt(coupanInfo.order.fuelAmount);
                        // console.log({ totalAmount });
                        log.success('Successfully fetched the coupan with the given code : ' + coupanInfo.code);
                        res.status(200).send({
                            message: 'Successfully applied the coupans with the given code : ' + coupanInfo.code,
                            totalAmount: totalAmount
                        })

                    }
                })
            }
        })
    } catch (error) {
        log.error("error while finding a coupan")
        return res.status(420).send({
            message: "error while finding a coupan with code : " + coupanInfo.code
        })
    }
}
async function getAllCoupansDao(coupanInfo, res) {
    log.success('dao layer entered');
    console.log({ coupanInfo });
    // const response = await getFunction(phoneNo);
    // console.log({ response });
    return await CoupanModel.find({}, (err, response) => {
        log.success('dao querry layer entered');
        if (err || !response) {
            log.error(`failed in the query in dao layer ` + err);
            return res.status(404).send({
                message: 'Cannot find any coupans with given phoneNo '
            })
        }
        console.log({ response });
        log.success('Successfully fetched all the coupans with given phoen no');
        res.status(200).send({
            message: 'Successfully fetched all the coupans',
            result: response
        })
    })
}


async function editCoupanDao(coupanInfo, res) {
    console.log({ coupanInfo });

    await CoupanModel.findOneAndUpdate({ code: coupanInfo.code }, {
        $set: {
            "status": coupanInfo.status,
        }
    }, async (err, response) => {
        if (err || !response) {
            console.log({ err }, { response });
            return res.status(404).send({
                message: 'no coupan found with ' + coupanInfo.code + " this code."
            })
        }
        else {
            return res.status(200).send({
                statusCode: 200,
                message: 'coupan status upgraded'
            })

        }
    })


}
async function addCoupanDao(coupanInfo, res) {
    console.log({ coupanInfo });

    await CoupanModel.findOne({ code: coupanInfo.code }, async (err, response) => {
        if (err || response) {
            console.log({ err }, { response });
            return res.status(409).send({
                message: 'coupan already exists'
            })
        }
        else {
            let newCoupan = new CoupanModel({
                "name": coupanInfo.name,
                "code": coupanInfo.code,
                "discount": coupanInfo.discount,
                "validTill": coupanInfo.validTill,
                "limit": coupanInfo.limit,
                "status": coupanInfo.status
            });

            const result = await newCoupan.save((error, payload) => {
                console.log("save querry entered");
                if (error || !payload) {
                    log.error(`Error in adding new coupan ` + error);
                    return res.status(500).send({
                        message: 'error in adding new coupana'
                    })
                } else {
                    log.blink('New coupan has been added to the db');
                    return res.status(200).send({
                        statusCode: 200,
                        message: 'New Coupan has successfully added'
                    })
                }

            })
            return result;
        }
    })

}

module.exports = {
    addCoupanDao,
    getAllCoupansDao,
    findCoupanByCode,
    editCoupanDao
}