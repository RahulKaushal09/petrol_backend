const express = require('express');
const app = express();
var cors = require('cors')
const mongoose = require('mongoose');

require('dotenv').config()


// console.log(app.get('env'));
// set env
const environment = process.env.NODE_ENV || "development";
console.log({ environment });
const dbUrl = "mongodb+srv://rahulkaushal:rahul123@cluster0.bmbvnaz.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp"

    ;

// Whitelisdty
const whitelist = [
    '*'
];

app.use(cors());
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

// -----------------> Routes Setup <---------------------------------//
app.use('/user', userservicerouter);

// --------------------------> Checking for Deployment purposes <----------------------- // 
app.get('/', (req, res) => {
    res.send('App is running');
});


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