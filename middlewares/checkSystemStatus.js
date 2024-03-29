const { SystemStatusModel } = require("../models/driverSchema");

const checkSystemStatusMiddleware = async (req, res, next) => {
    try {
        const systemStatus = await SystemStatusModel.findOne({});
        if (systemStatus && systemStatus.status === true) {
            // If the system status is 'ON', allow the request to proceed
            next();
        } else {
            // If the system status is not 'ON', return an error response
            return res.status(403).json({
                statusCode: 403,
                message: 'Access denied. System is turned OFF',
            });
        }
    } catch (error) {
        console.error('Error checking system status:', error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};

module.exports = checkSystemStatusMiddleware;
