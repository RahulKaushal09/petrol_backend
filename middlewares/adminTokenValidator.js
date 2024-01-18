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
        console.log({ payload });
        // const username = payload.username;
        const username = payload.username;
        const password = payload.password;

        await AdminModel.findOne(
            {
                username: username
            },
            async (err, response) => {
                console.log("point");
                console.log({ response });
                if (err || !response) {
                    return res.status(403).send({
                        message: 'validation error with token'
                    })
                }
                const temp = await bcrypt.compare(password, response.password);
                if (!temp) {
                    return res.status(403).send({
                        message: 'validation error with token'
                    })
                }
                else {
                    next();
                }
            })
    } catch (err) {
        return res.status(403).send({
            message: 'Access denied invalid authentication token'
        });
    }
}

module.exports = {
    adminTokenValidator
}