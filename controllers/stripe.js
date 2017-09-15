var logger = require('../servicos/logger.js')
var cors = require('cors');

const keySecret = process.env.STRIPE_SECRET_KEY;

const stripe = require("stripe")(keySecret);

const corsOptions = {
  origin: 'http://payment-app.surge.sh',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

module.exports = app => {
  app.post("/stripe/charge", cors(), (req, res) => {
  let amount = 100;


  console.log(req.body);

  stripe.customers.create({
     email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer =>
    stripe.charges.create({
      amount,
      description: "Sample Charge",
         currency: "eur",
         customer: customer.id,
         source: req.body.stripeToken
    }))
  .then(charge => res.send("Payment received"));
});
}
