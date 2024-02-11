const jwt = require('jsonwebtoken');
// const { UserEmailModel } = require('../models/user.schemaModel');
const { DriverModel, AdminModel } = require('../models/driverSchema')
const bcrypt = require('bcrypt');

const secretKey = "12345";

async function adminTokenValidator(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(403).send({
            message: 'Access denied authentication token not found'
        })
    }
    try {
        const payload = jwt.verify(token, secretKey);
        console.log({ token });

        if (payload.role == "admin") {
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
    adminTokenValidator
}