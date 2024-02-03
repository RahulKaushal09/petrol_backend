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

        return await CoupanModel.findOne({ code: coupanInfo.code, status: "true" }, async (err, response) => {
            log.success('dao querry layer entered');
            if (err || !response) {
                log.error(`failed in the query in dao layer ` + err);
                return res.status(201).send({
                    message: 'Oops Coupon does not exist.',
                    statusCode: 201
                })
            }
            else {
                console.log(response);
                await FuelModel.find({}, async (e, fuelRates) => {
                    if (e || !fuelRates) {
                        // console.log(r);
                        log.error(`Error in finding fuel value` + e);
                        return res.status(400).send({
                            message: 'Something Went Wrong',
                            statusCode: 400
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
                                    message: `Fuel Type Not Found`,
                                    statusCode: 404
                                });
                            }
                        } else {
                            console.log(`Fuel type ${fuelType} not found in database`);
                            return res.status(404).send({
                                message: `Fuel Type Not Found`,
                                statusCode: 404
                            });
                        }
                        rate = parseFloat(rate.replace('$', ''));

                        let totalAmount = parseFloat(coupanInfo.order.fuelAmount) * rate;
                        console.log(parseFloat(coupanInfo.order.fuelAmount));
                        // console.log({ totalAmount });
                        const discount = response.discount;
                        const temp = parseFloat(discount);
                        // console.log(parseInt(orderInfo.order.fuelAmount));
                        let discountValue = totalAmount;
                        totalAmount = ((100 - temp) / 100) * totalAmount;
                        discountValue = discountValue - totalAmount;
                        totalAmount = parseFloat(totalAmount.toFixed(2));
                        discountValue = parseFloat(discountValue.toFixed(2));
                        console.log({ totalAmount });

                        log.success('Successfully fetched the coupan with the given code : ' + coupanInfo.code);
                        res.status(200).send({
                            message: 'Your coupon ' + response.name + ' has been applied successfully.',
                            statusCode: 200,
                            result: {
                                name: response.name,
                                totalAmount: totalAmount,
                                discountValue: discountValue,
                                couponId: coupanInfo.code
                            }
                        })

                    }
                })
            }
        })
    } catch (error) {
        log.error("error while finding a coupan")
        return res.status(400).send({
            message: "Something Went Wrong",
            statusCode: 400
        })
    }
}
async function getAllCoupansDao(coupanInfo, res) {
    log.success('dao layer entered');
    // console.log({ coupanInfo });
    // const response = await getFunction(phoneNo);
    // console.log({ response });
    return await CoupanModel.find({ status: "true" }, (err, response) => {
        log.success('dao querry layer entered');
        if (err || !response) {
            log.error(`failed in the query in dao layer ` + err);
            return res.status(404).send({
                message: 'No Coupan Found',
                statusCode: 404
            })
        }
        console.log({ response });
        log.success('Successfully fetched all the coupans with given phoen no');
        res.status(200).send({
            message: 'Successfully fetched all the coupans',
            result: response,
            statusCode: 200
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
                message: 'coupon already exists',
                statusCode: 409
            })
        }
        else {
            let newCoupan = new CoupanModel({
                "name": coupanInfo.name,
                "code": coupanInfo.code,
                "discount": coupanInfo.discount,
                "status": coupanInfo.status
            });

            const result = await newCoupan.save((error, payload) => {
                console.log("save querry entered");
                if (error || !payload) {
                    log.error(`Error in adding new coupon ` + error);
                    return res.status(500).send({
                        message: 'Error in adding new coupon',
                        statusCode: 500
                    })
                } else {
                    log.blink('New coupon has been added to the db');
                    return res.status(200).send({
                        statusCode: 200,
                        message: 'New coupon has successfully added'
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