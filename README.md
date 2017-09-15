# node-api-study

This API simulates a payment app which receives an payment and process, store it in a database and set available possible steps via HATEOAS links

# Usage

To create a payment you must send a POST request to the address `https://node-api-study.herokuapp.com/pagamentos/pagamento` as follows:

Header: Content-Type: application/json

Body: The body is a JSON with two atributes `pagamento` and `cartao` where the `pagamento` must have

`forma_de_pagamento`: with `"payfast"` or `"cartao"`

`valor`: with the amount of the payment

`moeda`: with a string containing the currency which the payment was made

`descricao`: with some text describing the transaction


```
{
	"pagamento":{
		"forma_de_pagamento": "payfast",
		"valor": 4900.99,
		"moeda": "EUR",
		"descricao": "creating a payment"
	}
}
```

If you choose to set the `forma_de_pagamento` as `cartao` you must set the `cartao` atribute as follows

`numero`: with the card number

`bandeira`: with the card flag

`ano_de_expiracao`: with two digits of the year of expiration

`mes_de_expiracao`: with two digits of the month of expiration

`cvv`: with three digits of the cvv

```
{
	"pagamento":{
		"forma_de_pagamento": "cartao",
		"valor": 4900.99,
		"moeda": "EUR",
		"descricao": "criando um pagamento"
	},
	"cartao":{
		"numero": 1234123412341234,
		"bandeira": "visa",
		"ano_de_expiracao": 17,
		"mes_de_expiracao": 12,
		"cvv": 123
	}
}
```

This will return a JSON with the data about the sent payment, also containing a status for the payment, and for the credit card.

It will also contain links with the other possible operations, from there, which can consult or change the status of the payment

```
{
    "dados_do_pagamento": {
        "forma_de_pagamento": "cartao",
        "valor": 4900.99,
        "moeda": "EUR",
        "descricao": "criando um pagamento",
        "status": "CRIADO",
        "data": "2017-09-13T15:03:53.963Z",
        "id": 1
    },
    "cartao": {
        "dados_do_cartao": {
            "numero": 1234123412341234,
            "bandeira": "visa",
            "ano_de_expiracao": 17,
            "mes_de_expiracao": 12,
            "cvv": 123,
            "status": "AUTORIZADO"
        }
    },
    "links": [
        {
            "href": "https://node-api-study.herokuapp.com/pagamentos/pagamento/1",
            "rel": "confirmar",
            "method": "PUT"
        },
        {
            "href": "https://node-api-study.herokuapp.com/pagamentos/pagamento/1",
            "rel": "consultar",
            "method": "GET"
        },
        {
            "href": "https://node-api-study.herokuapp.com/pagamentos/pagamento/1",
            "rel": "cancelar",
            "method": "DELETE"
        }
    ]
}
```
# Aditional Features

This API are integrated with the SOAP Web Service from Correios do Brasil, which can calculate a delivery time

To know the delivery time you must send a POST to the address `https://node-api-study.herokuapp.com/correios/calculo-prazo` as follows:

Header: Content-Type: application/json

Body: The body is a JSON with a atribute `"cep"`

```
{
	"cep": "77700000"
}
```

For now you can use only valid brazilian ZIP codes as `"cep"`, here's a list of some that you can use:
```
77000000
77700000
65907230
01505-010
04105-070
```

This request will return a JSON similar to this:

```
{
    "CalcPrazoResult": {
        "Servicos": {
            "cServico": [
                {
                    "Codigo": 40010,
                    "PrazoEntrega": "3",
                    "EntregaDomiciliar": "S",
                    "EntregaSabado": "N",
                    "Erro": "",
                    "MsgErro": "",
                    "obsFim": "",
                    "DataMaxEntrega": "18/09/2017"
                }
            ]
        }
    }
}
```

The `"PrazoEntrega"` is the estimated amount of days for the delivery

The `"DataMaxEntrega"` is the maximum estimated day for the delivery
