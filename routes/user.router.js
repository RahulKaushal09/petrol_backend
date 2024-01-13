const express = require('express');
// const { authToken } = require('../middlewares/authToken');
const { verifyOtpController, sendOtpController, sendEmailOtp, registerDetails } = require('../controllers/user.controller')
const { authTokenvalidation } = require('../middlewares/authToken')

const userRouter = express.Router();

userRouter.post('/sendOtp', sendOtpController);//working
userRouter.post('/verifyOtp', verifyOtpController);//working
userRouter.post('/sendEmailOtp', authTokenvalidation, sendEmailOtp);//working
userRouter.post('/registerDetails', authTokenvalidation, registerDetails);//working
module.exports = userRouter;