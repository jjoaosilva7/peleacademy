# Sistema de Gestão de Entregas (Delivery)

Sistema de terminal em Python para gerenciar entregadores e pedidos de uma operação de delivery — cadastro de entregadores, lançamento de pedidos, atribuição de entregas, confirmação por código, cancelamento, relatórios e fechamento diário.

## Funcionalidades

- **Cadastro e edição de entregadores** — nome, placa do veículo e status (disponível/ocupado)
- **Lançamento de pedidos** — cálculo automático da taxa de entrega por faixa de km
- **Atribuição de pedidos** — só mostra entregadores disponíveis e pedidos pendentes
- **Confirmação de entrega por código** — código gerado aleatoriamente no momento do pedido, simulando um código enviado ao cliente
- **Cancelamento de pedidos** — libera o entregador automaticamente se já estava atribuído
- **Fechamento diário** — soma corridas, km rodados e valor a pagar por entregador, exportado em `.csv`
- **Relatório individual** — histórico total de entregas de um entregador específico
- **Persistência em JSON** — os dados são salvos automaticamente ao sair e recarregados na próxima execução

## Regras de negócio

**Cálculo da taxa por km:**
| Distância | Valor |
|---|---|
| até 5 km | R$ 5,00 |
| até 10 km | R$ 7,00 |
| acima de 10 km | R$ 10,00 |

**Status do pedido:** `pendente` → `em rota` → `entregue` (ou `cancelado`)

**Status do entregador:** `disponível` ↔ `ocupado`

## Como rodar

```bash
python main.py
```

O sistema cria automaticamente um arquivo `dados.json` na primeira execução para guardar os dados. Nas próximas vezes que o programa for aberto, esses dados são recarregados.

## Tecnologias e conceitos usados

- Python 3
- Dicionários aninhados para modelar entregadores e pedidos
- Módulos e pacotes (separação em `main.py` e `funcoes.py`)
- Tratamento de erros com `try/except`
- Módulo `datetime` para registrar data/hora da atribuição
- Módulo `random` para gerar código de confirmação
- Módulo `csv` para exportar o fechamento diário
- Módulo `json` para persistência de dados entre execuções
- `match/case` para o menu principal

## Estrutura do projeto

```
├── main.py       # menu, cadastro, listagens, persistência
├── funcoes.py    # cálculo de taxa, atribuição, fechamento, exportação CSV
└── dados.json    # gerado automaticamente ao rodar (não precisa criar manualmente)
```

## Possíveis melhorias futuras

- Suporte a múltiplas entregas simultâneas por entregador
- Interface gráfica ou web
- Testes automatizados
