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
const userRouter = express.Router();

userRouter.get('/getbyusername/:username', getByUsernameController,);//working
userRouter.get('/getbyphoneno/:phoneno', getByPhoneNoController,);//working
// getAdrbyID
userRouter.get('/getbyaddressbyId/:Id', getByIdController);//working
userRouter.post('/updatephone', updatePhoneController,);//working
userRouter.post('/verifyUpdatePhone', verifyUpdatePhoneController,);//working
userRouter.post('/updateAddress', authTokenValidator, updateAddress,);//working
userRouter.post('/addAddress', authTokenValidator, addAdressController,);//working
userRouter.delete('/deleteAddress', authTokenValidator, addressDeleteController);//working
userRouter.post('/sendotp', sendOtpController);//working
userRouter.post('/verifyOtp', verifyOtpController);//working
userRouter.post('/emailSendOtp', sendEmailOtp);//working
userRouter.post('/emailVerifyOtp', verifyEmailOtp);//working
userRouter.post('/updateusername', authTokenValidator, updateUsernameController,);// working
userRouter.post('/updatename', authTokenValidator, updateNameController,);// working
// userRouter.post('/middleware', authTokenValidator)// just for debugging

module.exports = userRouter;