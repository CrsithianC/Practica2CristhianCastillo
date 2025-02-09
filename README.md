# Practica2CristhianCastillo
## Parte A
--------

● Implementar en el frontal la operación de transfer.
● Vamos a asegurar que funciona el descubierto.

## Parte B
--------
● Vamos a extender el contrato de Bank.sol para que permita gestionar intereses hacia los clientes.
● Almacenaremos una variable que indique el porcentaje de interés que el banco aplica, y que podrá
ser modificada por el owner del despliegue.
● Almacenaremos la fecha del último check de intereses por usuario, de tal forma que cuando
calculamos de nuevo, siempre sea incremental.
● El cálculo de intereses devengados puede ser calculado en todas las operaciones (deposit, withdraw,
transfer y getBalance).
