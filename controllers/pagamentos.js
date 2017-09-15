var logger = require('../servicos/logger.js')

module.exports = function(app) {

  app.get('/', function(req, res) {
    res.status(302).redirect('https://github.com/ThiagoDallacqua/node-api-study/blob/master/README.md');
  });

  app.get('/pagamentos/pagamento', function(req, res) {
    console.log(`listando pagamentos`);
    logger.info(`listando pagamentos`);

    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDAO(connection);

    pagamentoDAO.lista(function(err, result) {
      if (err) {
        logger.error(`Erro ao consultar no DB: ${err}`);
        console.log(`Erro ao consultar no DB: ${err}`);

        res.status(500).send(err);
        return
      }

      console.log(`pagamentos encontrados: ${JSON.stringify(result)}`);
      logger.info(`pagamentos consultados no banco de dados: ${JSON.stringify(result)}`);

      res.json(result);
      return
    })
  });

  app.get('/pagamentos/pagamento/:id', function(req, res) {
    var id = req.params.id;

    console.log(`consultando pagamento ${id}`);
    logger.info(`consultando pagamento ${id}`);

    if (!process.env.NODE_ENV) {
      var memcachedClient = app.servicos.MemcachedClient();
      memcachedClient.get(`pagamento-${id}`, function(err, retorno) { //consulta na cache
        if (err || !retorno) {
          console.log('MISS - chave não encontrada');
          logger.warn('MISS - chave não encontrada em cache');

          var connection = app.infra.connectionFactory();
          var pagamentoDAO = new app.infra.PagamentoDAO(connection);

          pagamentoDAO.buscaPorId(id, function(err, result) {
            if (err) {
              res.status(500).send(err);
              return
            }

            console.log(`pagamento encontrado: ${JSON.stringify(result)}`);
            logger.info(`pagamento consultado no banco de dados: ${JSON.stringify(result)}`);

            res.json(result);
            return
          })
        }else {
          console.log(`HIT - valor: ${JSON.stringify(retorno)}`);

          res.json(retorno);
          return
        }
      })
    }

    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDAO(connection);

    pagamentoDAO.buscaPorId(id, function(err, result) {
      if (err) {
        logger.error(`Erro ao consultar no DB: ${err}`);
        console.log(`Erro ao consultar no DB: ${err}`);

        res.status(500).send(err);
        return
      }

      console.log(`pagamento encontrado: ${JSON.stringify(result)}`);
      logger.info(`pagamento consultado no banco de dados: ${JSON.stringify(result)}`);

      res.json(result);
      return
    })
  });

  app.post('/pagamentos/pagamento', function(req, res) {
    req.assert("pagamento.forma_de_pagamento", "Forma de pagamento é obrigatório")
      .notEmpty();

    req.assert("pagamento.valor", "Valor obrigatório, e deve ser decimal")
      .notEmpty()
      .isFloat();

    var erros = req.validationErrors();

    if (erros) {
      console.log("Ocorreram erros de validação");
      logger.error(`Ocorreram erros na validação com o cliente: ${erros}`);

      res.status(400).send(erros);
      return
    }

    var pagamento = req.body["pagamento"];

    console.log('processando requisição de um novo pagamento');
    logger.info(`processando nova requisição de pagamento: ${JSON.stringify(pagamento)}`);

    pagamento.status = 'CRIADO';
    pagamento.data = new Date;

    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDAO(connection);

    pagamentoDAO.salva(pagamento, function(err, result) {
      if (err) {
        console.log(`Erro ao persistir no DB: ${err}`);
        logger.error(`Erro ao persistir no DB: ${err}`);

        res.status(500).send(err)
      }else{
        pagamento.id = result._id;
        console.log('pagamento criado');
        logger.info(`pagamento criado: ${JSON.stringify(pagamento)}`);

        if (!process.env.NODE_ENV) {
          var memcachedClient = app.servicos.MemcachedClient(); //cacheia temporariamente o pagamento
          memcachedClient.set(`pagamento-${pagamento.id}`, pagamento, 60000, function(err) {
            console.log(`nova chave adicionada ao cache: pagamento-${pagamento.id}`);
          });
        } /*else {
          memcachedClient.set(`pagamento-${pagamento.id}`, pagamento, 60000);
        }*/

        if (pagamento.forma_de_pagamento == 'cartao') {
          var cartao = req.body;
          var clienteCartoes = new app.servicos.ClienteCartoes();

          clienteCartoes.autoriza(cartao, function(error, request, response, retorno) {
            if (error) {
              console.log(error);
              logger.error(`erro ao processar pagamento com cartão: ${error}`)

              res.status(400).send(error);
              return;
            }
            console.log(retorno);

            logger.info(`pagamento com cartão processado com sucesso: ${JSON.stringify(retorno)}`);

            res.location(`/pagamentos/pagamento/${pagamento.id}`);

            if (!process.env.NODE_ENV) {
              var response = {
                dados_do_pagamento: pagamento,
                cartao: retorno,
                links: [
                  {
                    href: `http://localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                    rel: 'confirmar',
                    method: 'PUT'
                  },
                  {
                    href: `http://localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                    rel: 'consultar',
                    method: 'GET'
                  },
                  {
                    href: `http://localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                    rel: 'cancelar',
                    method: 'DELETE'
                  }
                ]
              }

              res.status(201).json(response);
              return;
            }else{

              var response = {
                dados_do_pagamento: pagamento,
                cartao: retorno,
                links: [
                  {
                    href: `https://node-api-study-mogodb.herokuapp.com/pagamentos/pagamento/${pagamento.id}`,
                    rel: 'confirmar',
                    method: 'PUT'
                  },
                  {
                    href: `https://node-api-study-mogodb.herokuapp.com/pagamentos/pagamento/${pagamento.id}`,
                    rel: 'consultar',
                    method: 'GET'
                  },
                  {
                    href: `https://node-api-study-mogodb.herokuapp.com/pagamentos/pagamento/${pagamento.id}`,
                    rel: 'cancelar',
                    method: 'DELETE'
                  }
                ]
              }

              res.status(201).json(response);
              return;
            }
          });
        } else{
          res.location(`/pagamentos/pagamento/${pagamento.id}`);
          console.log(pagamento);
          var response = {
            dados_do_pagamento: pagamento,
            links: [
              {
                href: `https://node-api-study-mogodb.herokuapp.com/pagamentos/pagamento/${pagamento.id}`,
                rel: 'confirmar',
                method: 'PUT'
              },
              {
                href: `https://node-api-study-mogodb.herokuapp.com/pagamentos/pagamento/${pagamento.id}`,
                rel: 'consultar',
                method: 'GET'
              },
              {
                href: `https://node-api-study-mogodb.herokuapp.com/pagamentos/pagamento/${pagamento.id}`,
                rel: 'cancelar',
                method: 'DELETE'
              }
            ]
          }

          res.status(201).json(response)
        }
      }
    })
  });

  app.put('/pagamentos/pagamento/:id', function(req, res) {
    var id = req.params.id;
    var pagamento = {};

    pagamento.id = id;
    pagamento.status = 'CONFIRMADO';

    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDAO(connection);

    pagamentoDAO.atualiza(pagamento, function(err, result) {
      if (err) {
        logger.error(`Erro ao atualizar no DB: ${err}`);

        res.status(500).send(err);
        return
      }

      console.log('pagamento confirmado');
      logger.info(`pagamento confirmado: ${JSON.stringify(pagamento)}`)

      if (!process.env.NODE_ENV) {
        var memcachedClient = app.servicos.MemcachedClient(); //cacheia temporariamente o pagamento

        memcachedClient.set(`pagamento-${pagamento.id}`, pagamento, 60000, function(err) {
          console.log(`chave atualizada no cache: pagamento-${pagamento.id}`);
        });
      }

      res.send(pagamento);
    })

  });

  app.delete('/pagamentos/pagamento/:id', function(req, res) {
    var id = req.params.id;
    var pagamento = {};

    pagamento.id = id;
    pagamento.status = 'CANCELADO';

    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDAO(connection);

    pagamentoDAO.atualiza(pagamento, function(err, result) {
      if (err) {
        logger.error(`Erro ao atualizar no DB: ${err}`);

        res.status(500).send(err);
        return
      }

      console.log('pagamento cancelado');

      logger.info(`pagamento cancelado: ${JSON.stringify(pagamento)}`);

      if (!process.env.NODE_ENV) {
        var memcachedClient = app.servicos.MemcachedClient(); //cacheia temporariamente o pagamento

        memcachedClient.set(`pagamento-${pagamento.id}`, pagamento, 60000, function(err) {
          console.log(`chave atualizada no cache: pagamento-${pagamento.id}`);
        });
      }

      res.status(204).send(pagamento);
    })
  });
}
