var logger = require('../servicos/logger.js');

const keySecret = process.env.STRIPE_SECRET_KEY;

const stripe = require("stripe")(keySecret);

module.exports = app => {
  app.post("/stripe/charge", (req, res) => {
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
