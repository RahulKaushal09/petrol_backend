const FuelValidator = require('../models/fuel.schema.validator');
const Logger = require('../logger/logger');
const log = new Logger('Fuel_Controller');
const fuelDao = require('../Dao/fuel.dao')

async function createFuelController(req, res) {
    console.log("check");
    const fuelInfo = req.body;
    let { error } = FuelValidator.validateFuelSchema(fuelInfo, res);
    console.log("check");
    if (isNotValidSchema(error, res)) return;
    console.log("check2");
    try {
        console.log("check3");
        const response = await fuelDao.addFuelDao(fuelInfo, res);
        return response;
    } catch (error) {
        log.error(`Error in adding new fuel` + error);
    }
}

async function getAllfuelsController(req, res) {
    log.info('controller entered');
    const fuelInfo = req.params.phoneNo;
    try {
        const result = await fuelDao.getAllfuels(fuelInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in Dao trycatch layer ` + error)
    }
}

async function updateFuelController(req, res) {
    const fuelInfo = req.body;
    let { error } = FuelValidator.validateUpdateFuelSchema(fuelInfo, res);
    console.log("check");
    if (isNotValidSchema(error, res)) return;
    try {
        console.log("validation and schema done");
        const result = await fuelDao.updateFuelDao(fuelInfo, res);
        return result;
    } catch (error) {
        log.error(`Error in updating user details` + error);
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
    createFuelController,
    getAllfuelsController,
    updateFuelController
};