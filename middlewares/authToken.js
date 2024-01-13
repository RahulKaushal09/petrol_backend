const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/user.schemaModel')
const secretKey = "123456789";

async function getUserRole(phoneNo, res) {
    return await UserModel.findOne({ phoneNo: phoneNo })
}
async function authTokenvalidation(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(403).send({
            message: 'Access denied authentication token not found'
        })
    }
    try {
        const payload = jwt.verify(token, secretKey);
        const user = await getUserRole(payload.phoneNo);
        if (user && user.email == null) {

            console.log({ payload });
            next();
        }
        else {
            return res.status(403).send({
                message: 'Bad Authentication'
            });
        }

    } catch (err) {
        return res.status(403).send({
            message: 'Access denied invalid authentication token'
        });
    }
}

module.exports = {
    authTokenvalidation
}