const jwt = require('jsonwebtoken');

const secretKey = "123456789";

function authTokenValidator(req, res, next) {
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
        const phoneNo = payload.phoneNo;
        // console.log(req.body.phoneNo, " req flagger");
        // console.log(req.body.username, " req flagger for middleware");
        // if (phoneNo !== req.body.phoneNo && username !== req.body.username) {
        //     console.log("middleware check for validation");
        //     log.error(`username or phoneNo not matching with token`);
        //     return res.status(403).send({
        //         message: 'Validation error with token'
        //     })
        // }
        if (phoneNo !== req.body.phoneNo) {
            console.log("middleware check for validation");
            log.error(`username or phoneNo not matching with token`);
            return res.status(403).send({
                message: 'Validation error with token'
            })
        }
        next();
    } catch (err) {
        return res.status(403).send({
            message: 'Access denied invalid authentication token'
        });
    }
}

module.exports = {
    authTokenValidator
}