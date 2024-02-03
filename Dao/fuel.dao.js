const Logger = require('../logger/logger');
const log = new Logger('Coupan_Dao');
// const { orderModel } = require('../models/order.schemaModel')
// const { UserModel } = require('../models/user.schemaModel')
const { FuelModel } = require('../models/fuel.schemaModel');

const secretKey = "12345"

async function getAllfuels(req, res) {
    log.success('dao layer entered');
    // console.log({ fuelInfo });
    return await FuelModel.find({}, (err, response) => {
        log.success('dao querry layer entered');
        if (err || !response) {
            log.error(`failed in the query in dao layer ` + err);
            return res.status(404).send({
                message: 'Something went wrong',
                statusCode: 404
            })
        }

        let result = { petrol: {}, diesel: {}, premium: {} };
        result.petrol = response[0].petrol;
        result.diesel = response[0].diesel;
        result.premium = response[0].premium;
        log.success('Successfully fetched all the fuels with given phoen no');
        res.status(200).send({
            statusCode: 200,
            result: result
        })
    })
}

async function updateFuelDao(fuelInfo, res) {
    // const phoneNo = fuelInfo.phoneNo;
    // console.log({ phoneNo }, "moment of truth flag");
    await FuelModel.findOneAndUpdate({}, {
        petrol: fuelInfo.petrol,
        diesel: fuelInfo.diesel,
        premium: fuelInfo.premium
    }, (err, response) => {
        console.log("updatePoint");
        if (err || !response) {
            log.error(`Error while updating the phone No ${phoneNo}`);
            return res.status(404).send({
                message: 'Error in updating the phoneNo'
            })
        }
        log.info(`Successfully updated fuels`);
        return res.status(200).send({
            statusCode: 200,
            message: `updated the fuels`
        })
    });
}

async function addFuelDao(fuelInfo, res) {
    console.log({ fuelInfo });

    const filter = {}; // Add appropriate filtering criteria based on your data structure
    const update = {
        $set: {
            "petrol": fuelInfo.petrol,
            "diesel": fuelInfo.diesel,
            "premium": fuelInfo.premium
        }
    };

    const options = { upsert: true, new: true };

    const result = await FuelModel.findOneAndUpdate(filter, update, options, (err, response) => {
        console.log("update query entered");
        if (err || !response) {
            log.error(`Error in updating fuel information: ${err}`);
            return res.status(500).send({
                message: 'Error in updating fuel information'
            });
        }
        log.blink('Fuel information has been updated in the db');
        return res.status(200).send({
            statusCode: 200,
            message: 'Fuel information has been successfully updated'
        });
    });

    return result;
}

module.exports = {
    addFuelDao,
    getAllfuels,
    updateFuelDao
}