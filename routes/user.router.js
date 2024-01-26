const express = require('express');
const {
    addAdressController,
    getByUsernameController,
    updateAddress,
    updatePhoneController,
    getByPhoneNoController,
    sendOtpController,
    verifyOtpController,
    updateUsernameController,
    addressDeleteController,
    sendEmailOtp,
    verifyEmailOtp,
    updateNameController,
    getByIdController,
    verifyUpdatePhoneController
} = require('../controllers/user.controller')
const { authTokenValidator } = require('../middlewares/authTokenValidator');
const checkSystemStatusMiddleware = require('../middlewares/checkSystemStatus');
const userRouter = express.Router();

// userRouter.get('/getbyusername/:username', getByUsernameController,);//working
// userRouter.get('/getbyphoneno/:phoneNo', authTokenValidator, getByPhoneNoController,);//working
// // getAdrbyID
// userRouter.get('/getbyaddressbyId/:Id', getByIdController);//working
userRouter.post('/updatephone', authTokenValidator, checkSystemStatusMiddleware, updatePhoneController,);//working
userRouter.post('/verifyUpdatePhone', authTokenValidator, checkSystemStatusMiddleware, verifyUpdatePhoneController,);//working
userRouter.post('/updateAddress', authTokenValidator, checkSystemStatusMiddleware, updateAddress,);//working
userRouter.post('/addAddress', authTokenValidator, checkSystemStatusMiddleware, addAdressController,);//working
userRouter.delete('/deleteAddress', authTokenValidator, checkSystemStatusMiddleware, addressDeleteController);//working
userRouter.post('/sendotp', sendOtpController);//working
userRouter.post('/verifyOtp', verifyOtpController);//working
userRouter.post('/emailSendOtp', sendEmailOtp);//working
userRouter.post('/emailVerifyOtp', authTokenValidator, checkSystemStatusMiddleware, verifyEmailOtp);//working
// userRouter.post('/updateusername', authTokenValidator, updateUsernameController,);// working
// userRouter.post('/updatename', authTokenValidator, updateNameController,);// working
// userRouter.post('/middleware', authTokenValidator)// just for debugging

module.exports = userRouter;