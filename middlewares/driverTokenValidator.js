const jwt = require('jsonwebtoken');
// const { UserEmailModel } = require('../models/user.schemaModel');
const { DriverModel } = require('../models/driverSchema')
const bcrypt = require('bcrypt');

const secretKey = "12345";

async function driverTokenValidator(req, res, next) {
    const token = req.header('x-auth-token');
    // console.log((!token));
    if (!token) {
        return res.status(403).send({
            message: 'Access denied authentication token not found'
        })
    }
    try {
        const payload = jwt.verify(token, secretKey);
        console.log(payload);
        if (payload.role == "driver") {
            const username = payload.username;
            req.username = username;
            next();
        }
        else {
            return res.status(403).send({
                message: 'Access denied invalid authentication token'
            });
        }


    } catch (err) {
        return res.status(403).send({
            message: 'Access denied invalid authentication token'
        });
    }
}

module.exports = {
    driverTokenValidator
}