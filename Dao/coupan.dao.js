const Logger = require('../logger/logger');
const log = new Logger('Coupan_Dao');
// const { orderModel } = require('../models/order.schemaModel')
// const { UserModel } = require('../models/user.schemaModel')
const { CoupanModel } = require('../models/coupan.schemaModel');

const secretKey = "12345"

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
                "limit": coupanInfo.limit
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
    getAllCoupansDao
}