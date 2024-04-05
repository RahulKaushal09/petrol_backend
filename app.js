const express = require('express');
const app = express();
const morgan = require('morgan');
var cors = require('cors')
const mongoose = require('mongoose');
const cron = require('node-cron');
// const stripe = require('stripe')("sk_test_51ObmyHDN57vbqAvmK5bOHIztyaJ2NbK8fQB1Rr0X60bBvBfW77PdbOQZ3FGsj0pJUoinVMkjPrgzPkbD221EAzo900mGlIThIL");
// const endpointSecret = "whsec_017cba7b95a3b8bb1430949eacf56493b9900799f058be9cb9faa8c15eab5edb";

const { updatedScheduleDao, createOrUpdateScheduleDao } = require('./Dao/order.dao')
require('dotenv').config()

const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('59942b33d6b6c772.pem'),
    cert: fs.readFileSync('59942b33d6b6c772.crt'),
    ca: fs.readFileSync('gd_bundle-g2-g1.crt')
};

// console.log(app.get('env'));
// set env
const environment = process.env.NODE_ENV || "development";
console.log({ environment });
const dbUrl = process.env.dburl;
// Whitelisdty
const whitelist = [
    '*'
];

app.use((req, res, next) => {
    if (req.path === '/order/webhook') {
        // express.json({ verify: (req, res, buf) => { req.rawBody = buf } })
        express.raw({ type: 'application/json' })(req, res, next);
    } else {
        express.json({ limit: '30mb', extended: true })(req, res, next);
    }
});
// app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use(bodyParser.json({ limit: "30mb", extended: true }));
// <-- Add this line
app.use(cors());

// some basic header for auth
app.use(function (req, res, next) {
    const origin = req.get('referer');
    const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
    if (isWhitelisted) {
        // res.header("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
        res.header("Access-Control-Expose-Headers", "x-auth-token");
        // res.setHeader('Access-Control-Allow-Credentials', true);
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
const fuelservicerouter = require('./routes/fuel.router')

// -----------------> Routes Setup <---------------------------------//
app.use('/user', userservicerouter);
app.use('/order', orderservicerouter);
app.use('/coupon', coupanservicerouter);
app.use('/driver', driverservicerouter);
app.use('/fuel', fuelservicerouter);




// --------------------------> Checking for Deployment purposes <----------------------- // 
app.get('/', (req, res) => {
    res.send('App is running');
});


if (environment === 'development') {
    app.use(morgan('combined'));
    // ------------------------> Logger (Morgan) <---------------------------- //
    console.log('Morgan is enabled...');
}

const port = process.env.PORT || 443;

const server = https.createServer(options, app);

server.listen(port, () => {
    console.log(`Application running in ${environment} environment, listening to port ${port}....`);
    try {
        mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
            .then(() => {
                console.log('Connected to MongoDB');
                createOrUpdateScheduleDao();

                // Schedule the updatedScheduleDao function to run every day at 12 AM
                cron.schedule('0 0 * * *', () => {
                    updatedScheduleDao();
                });
            })
            .catch(error => console.error('Error connecting to MongoDB:', error));
    } catch (error) {
        console.error('unable to connect, please check your connection....' + error)
    }
});