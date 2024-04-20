require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const stripe = require('stripe')("sk_test_51ObmyHDN57vbqAvmK5bOHIztyaJ2NbK8fQB1Rr0X60bBvBfW77PdbOQZ3FGsj0pJUoinVMkjPrgzPkbD221EAzo900mGlIThIL");
const { addOrderDao } = require('../Dao/order.dao');
// const endpointSecret = process.env.stripeEndpointSecret;
const Logger = require('../logger/logger');
const log = new Logger('Order_Controller');
// const endpointSecret = "whsec_017cba7b95a3b8bb1430949eacf56493b9900799f058be9cb9faa8c15eab5edb";
const endpointSecret = "we_1P7inADN57vbqAvmIUNt3Uuh";


let orderDetails;
let token;
exports.handleWebhookEvent = async (request, response) => {
    const headers = request.headers;
    const sig = headers['stripe-signature'];
    // console.log(typeof (sig));

    let event;


    try {
        // console.log(request.body)

        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.log(err);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            // Handle payment intent succeeded logic
            break;

        case 'checkout.session.completed':
            const session = event.data.object;
            orderDetail = session.metadata;


            orderDetails = JSON.parse(orderDetail.OrderDetails);
            token = orderDetail.token;

            const transactionId = session.payment_intent || session.payment_intent;
            orderDetails.order.transactionId = transactionId;
            handleOrderWebhook();
            // console.log(transactionId);


            break;

        case 'payment_intent.created':
            // Route the order event to the appropriate handler
            // console.log(orderDetails);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.send();
};

async function handleOrderWebhook() {
    // const orderField = event.data.object.order; // Repla ce 'order' with the actual field name in your event data
    // Handle the order webhook logic here
    await addOrderDao(token, orderDetails)

    return;
}
