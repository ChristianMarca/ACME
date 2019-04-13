# ACME Solution

>Calcular el total que la empresa debe pagar a un empleado, en función de las horas que trabajaron y los tiempos durante los cuales trabajaron.

### (JavaScript - Node.js)

### Para iniciar

##### Instalar dependencias para pruebas y linter

```npm install```

##### Ejecutar

```npm start```

o

```node main.js```

### Pruebas

```npm test```

o

```npm run test```

### Datos de ingreso

.txt file con información de cada empleado con un formato como se muestra a continuación

>RENE=MO10:00-12:00,TU10:00-12:00,TH01:00-03:00,SA14:00-18:00,SU20:00-21:00

>ASTRID=MO10:00-12:00,TH12:00-14:00,SU20:00-21:00

>JHON=MO08:00-15:00,TH12:00-23:00,SU20:00-21:00

### Restricciones

Debido a la naturaleza del lenguaje, se optó por usar el formato del texto JSON para establecer las restricciones que se usan para realizar el cálculo.

### Diseño

1. Leer el archivo y generar un array con la información de cada empleado.

Ejemplo

```Y=[...,'ASTRID=MO10:00-12:00,TH12:00-14:00,SU20:00-21:00',...]```

2. Convertir cada uno de los elementos del array (cada elemento contiene la información de un empleado).

De un tipo string a un tipo array mediante la implementación de la expresión regular ``/([[a-z]+|[^a-z]+]|[^=,:-]+)/gi`` y proceder a su análisis.

Ejemplo

``X=[..., 'ASTRID','MO','10','00','12','00','TH','12','00','14','00','SU','20','00','21','00',...]``

Donde <a href="https://www.codecogs.com/eqnedit.php?latex=X\in&space;Y" target="_blank"><img src="https://latex.codecogs.com/gif.latex?X\in&space;Y" title="X\in Y" /></a>, esta metodología permite trabajar de manera más eficiente dado que ya tenemos datos estructurados.

3. Tomar cada elemento del array y extraer el subarreglo

``X1=['ASTRID','MO','10','00','12','00','TH','12','00','14','00','SU','20','00','21','00']``

Trabajar con el sub-conjunto <a href="https://www.codecogs.com/eqnedit.php?latex=X_{1}[1,...,N-1]" target="_blank"><img src="https://latex.codecogs.com/gif.latex?X_{1}[1,...,N-1]" title="X_{1}[1,...,N-1]" /></a> y proceder a realizar un análisis por bloques, tomar bloques de 5 elementos elementos consecutivos que corresponde a un dia de trabajo de un empleado.

Ejemplo

``X'=['MO','10','00','12','00']``

Donde <a href="https://www.codecogs.com/eqnedit.php?latex=X'\subseteq&space;X" target="_blank"><img src="https://latex.codecogs.com/gif.latex?X'\subseteq&space;X" title="X'\subseteq X" /></a> y en base a la cabecera  ``X'[0]`` del subarray extraer el conjunto de restricciones que se usará para el análisis.

Ejemplo

``{
           "start": "09:01",
           "end": "18:00",
           "USD": 15
       }``

4. Para el cálculo del valor a pagar por día

Realizar un análisis mediante la restricción, es decir las comparaciones son realizadas por una iteraciones por cada restricción en donde se procede a realizar dos comprobaciones, la comprobación de límite superior y de límite inferior, las pruebas establecen si la hora y minuto de inicio y la de final se encuentran ubicadas dentro de los rangos de la restricción, caso contrario procede a la siguiente restricción, cuando encuentra una coincidencia se procede a calcular el tiempo (# de horas) entre las dos horas del día, mediante un sencillo procedimiento

```
if (startMunite > endMinute)
   then
       endHour--
       endMinute+=60
   end if
return (endHour - startHour + (endMinute - startMinute)/60)
```

Luego proceder a calcular el monto por día multiplicando el número de horas por el valor por hora de trabajo establecido en la restricción.

Para el caso cuando un empleado haya trabajado en un rango de horas que se encuentren entre dos restricciones se procede a hacer un procedimiento que establece, se debe identificar las restricciones que cumplan con las restricciones de límite superior (para la restricción superior) y límite inferior (para la restricción inferior) al igual que el caso anterior, una vez se establece el conjunto de restricciones que cumplen con las horario del trabajador se procede a realizar el cálculo de horas por día mediante una recursión al método, dividiendo el problema en dos el cual establece, tomar la hora de inicio y el límite superior de la restricción de horario inferior y calcular el pago por dia luego tomar el límite inferior de la restricción de horario superior y el final de la hora de trabajo y finalmente sumar los dos valores.