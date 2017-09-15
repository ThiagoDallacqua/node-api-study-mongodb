var logger = require('../servicos/logger.js');

const keySecret = process.env.STRIPE_SECRET_KEY;
const keyPublishable = process.env.STRIPE_PUBLISHABLE_KEY;

const stripe = require("stripe")(keySecret);

module.exports = app => {
  app.get("/stripe", (req, res) =>
  res.render("index.pug", {keyPublishable}));

  app.post("/stripe/charge", (req, res) => {
    stripe.charges.create({
      amount: 10000,
      description: "Sample Charge",
      currency: "eur",
      source: req.body.id
    })
    .then((err, charge) => {
      res.send("Payment received")
      return
  });
});
}
