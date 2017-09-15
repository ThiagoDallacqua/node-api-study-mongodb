var app = require('./config/express')();
var porta = process.env.PORT || 3001;

app.listen(porta, function() {
  console.log(`Servidor Rodando na porta ${porta}`);
});
