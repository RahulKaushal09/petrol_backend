const express = require('express');
const app = express();
const morgan = require('morgan');
var cors = require('cors')
const mongoose = require('mongoose');

require('dotenv').config()


// console.log(app.get('env'));
// set env
const environment = process.env.NODE_ENV || "development";
console.log({ environment });
const dbUrl = "mongodb+srv://ayush:ayush@cluster0.rajkpzr.mongodb.net/";

// Whitelisdty
const whitelist = [
    '*'
];

app.use(cors())
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const bodyParser = require('body-parser');

// some basic header for auth
app.use(function (req, res, next) {
    const origin = req.get('referer');
    const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
    if (isWhitelisted) {
        res.header("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
        res.header("Access-Control-Expose-Headers", "x-auth-token");
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    }
    if (req.method === 'OPTIONS') res.sendStatus(200);
    else next();
});

// -----------------> Routes <-----------------------------------//

const userservicerouter = require('./routes/user.router');
const orderservicerouter = require('./routes/order.router');
const coupanservicerouter = require('./routes/coupan.router');
const driverservicerouter = require('./routes/driver.router')

// -----------------> Routes Setup <---------------------------------//
app.use('/user', userservicerouter);
app.use('/order', orderservicerouter);
app.use('/coupan', coupanservicerouter);
app.use('/driver', driverservicerouter);

app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));


// --------------------------> Checking for Deployment purposes <----------------------- // 
app.get('/', (req, res) => {
    res.send('App is running');
});


if (environment === 'development') {
    app.use(morgan('combined'));
    // ------------------------> Logger (Morgan) <---------------------------- //
    console.log('Morgan is enabled...');
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Application running in ${environment} environment, listening to port ${port}....`);
    try {
        mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
            .then(console.log('connected to mongo database....'));
    } catch (error) {
        console.error('unable to connect, please check your connection....' + error)
    }
});