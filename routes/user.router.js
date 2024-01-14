const express = require('express');
const {
    registerNewUser,
    addAdressController,
    getByUsernameController,
    updateAddress,
    updatePhoneController,
    getByPhoneNoController,
    sendOtpController,
    verifyOtpController,
    emailOtpSendController,
    updateDetailsController,
    addressDeleteController
    // emailOtpVerifyController
} = require('../controllers/user.controller')
const { authTokenValidator } = require('../middlewares/authTokenValidator');
const userRouter = express.Router();

userRouter.get('/getbyusername/:username', authTokenValidator, getByUsernameController,);//working
userRouter.get('/getbyphoneno/:phoneno', authTokenValidator, getByPhoneNoController,);//working
userRouter.post('/register', authTokenValidator, registerNewUser);//working
// userRouter.post('/login', loginController);
userRouter.post('/updatephone', authTokenValidator, updatePhoneController,);//working
userRouter.post('/updateAddress', authTokenValidator, updateAddress,);//working
userRouter.post('/addAddress', authTokenValidator, addAdressController,);//working
userRouter.delete('/deleteAddress', addressDeleteController);//working
userRouter.post('/sendotp', sendOtpController);//working
userRouter.post('/emailSendOtp', emailOtpSendController);//underprogress
// userRouter.post('/emailVerifyOtp', emailOtpVerifyController);
userRouter.post('/verifyOtp', verifyOtpController);//working
userRouter.post('/updatedetails', updateDetailsController,);//working
// userRouter.post('/middleware', authTokenValidator)// just for debugging

module.exports = userRouter;