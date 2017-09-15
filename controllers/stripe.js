var logger = require('../servicos/logger.js');

const keySecret = process.env.STRIPE_SECRET_KEY;
const keyPublishable = process.env.STRIPE_PUBLISHABLE_KEY;

const stripe = require("stripe")(keySecret);

module.exports = app => {
  app.get("/stripe", (req, res) =>
  res.render("index.pug", {keyPublishable}));

  app.post("/stripe/charge", (req, res) => {
  console.log(req.body);

  stripe.charges.create({
    amount: 100,
    description: "Sample Charge",
    currency: "eur",
    customer: customer.id,
    source: req.body.card
  })
  .then(charge => res.send("Payment received"));
});
}
