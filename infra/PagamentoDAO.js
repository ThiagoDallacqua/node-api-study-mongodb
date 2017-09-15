var mongoose = require('mongoose');

const schemaPagamentos = new mongoose.Schema({
  forma_de_pagamento: String,
  valor: Number,
  moeda: String,
  descricao: String,
  status: String,
  data: Date
});

class PagamentoDAO {
  constructor(connection) {
    this._connection = connection;
    this._paymentSchema = schemaPagamentos;
    this._Payment = this._connection.model("Payment", this._paymentSchema);
  }

  lista(callback){
    let payment = this._Payment;
    payment.find({}, callback);
  }

  salva(args, callback){
    let payment = this._Payment;
    payment.create(args, callback)
  }

  atualiza(args, callback){
    let payment = this._Payment;
    let id = args.id;
    let status = args.status;

    payment.update({"_id": id}, {$set: {status: status}}, callback);
  }

  buscaPorId(args, callback){
    let payment = this._Payment;
    payment.find({"_id": args}, callback);
  }
}

module.exports = function() {
  return PagamentoDAO
}
