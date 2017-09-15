var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

function createDBConnection() {
  if (!process.env.NODE_ENV) {
    mongoose.connect("mongodb://localhost/payfast", {useMongoClient: true})
  }

  if (process.env.NODE_ENV == 'production') {
    mongoose.openUri(process.env.MONGODB_URI)
  }

  return mongoose
}

module.exports = function() {
  return createDBConnection;
}
