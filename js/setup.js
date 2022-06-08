/*
Configuración de estilos gráficos
*/
// LENGUA, MATES, CCSS, CCNN, MUSICA, PLASTICA, AUTONOMICA, RELIGION, GLOBALIZADO, FRANCES
var ASIGNATURA = "LENGUA";
// INFANTIL, PRIMARIA, SECUNDARIA (especificar INFANTIL para 1º y 2º de primaria)
var ETAPA_EDUCATIVA = "PRIMARIA";
// nada ("") o SM, IKASMINA, XERME, DAYTON, ARRELS, CRUILLA
var LOGOTIPO = "";



// para añadir audio de instrucciones, poner mp3 y ogg en la carpeta "data/audios/" y:
var instruccAudio = "instrucciones.mp3"; // si no, comentar o borrar esta línea

/*
Filtros de texto: se ejecutarán al pinchar el botón de corregir, en el mismo orden en que aparezcan aquí. Son:
1: convierte espacios dobles en simples
2: elimina saltos de párrafo y tabuladores
3: case-insensitive ("a" equivale a "A")
4: diacritics-insensitive ("a" equivale a "á", "à", "ä" y "â")
5: se elimina el espacio en la combinación de espacio + ENTER o cualquiera de estos caracteres: .,;:!?”’)}]…
6: punctuation-insensitive (se ignoran los siguientes caracteres: .,;:¡!¿?'“”‘’"(){}[]…-–—_)
*/
var filters = [ 1, 2 ];

/*
Si existe esta variable "bolsaDePalabras", cambia totalmente el
modo de juego, pasando a tener las siguientes características:
-No existirá pantalla de selección de dificultad.
-Sólo salen las palabras especificadas.
-Si el usuario acierta una palabra, ya no vuelve a salir.
-Si el usuario no teclea una palabra, volverá a salir al final, hasta que la teclee correctamente.
-Cuando no hay más palabras, termina el juego, saliendo la pantalla de ENHORABUENA.
-La velocidad de las palabras es constante => se puede cambiar en variable subsiguiente.
-Opcionalmente, podrá mostrarse una imagen.
-Opcionalmente, podrá mostrarse un botón de sonido. En este caso (vid las siguientes reglas):
	-La serpiente no aparecerá hasta que se pulse el play.
	-El usuario puede escuchar el audio todas las veces que quiera.
-Cuando haya imagen o sonido, la palabra puede mostrarse desde el principio o no (parámetro "visible"), pero irá escribiéndose al teclearse correctamente.

El audio se especificará en su versión mp3, pero también tendrá su versión en ogg.
El tamaño mínimo de las imágenes será:
ancho: hasta 250px;
alto: hasta 195px;
Idealmente se pondrán al doble de tamaño, para dar mayor calidad en pantallas de doble resolución,
así que su máximo será de:
ancho: hasta 500px;
alto: hasta 390px;
La aplicación las redimensionará automática y proporcionalmente para adaptarse al área disponible.
*/
var bolsaDePalabras = [
	{
		palabra:"murciélago"
	},
	{
		palabra:"koala"
	},
	{
		palabra:"juego"
	},
	{
		palabra:"sandía"
	},
	{
		palabra:"sueño"
	},
	{
		palabra:"museo"
	},
	{
		palabra:"serpiente"
	},
	{
		palabra:"frío"
	},
	{
		palabra:"agua"
	}
]

// la siguiente variable sólo se aplica en caso de existir una bolsa de palabras
var velocidad = 1.5; // 1 = lento, 2 = normal, 3 = rápido... Se puede poner cualquier número (y con decimales)
/*
Cuánto tiempo aprox. está en pantalla una palabra según la velocidad:
valocidad 1   => 18 segundos
valocidad 1.5 => 12 segundos
valocidad 2   =>  9 segundos
valocidad 3   =>  6 segundos
...
*/


/*

OPCIONES DE CONFIGURACIÓN PARA LA MODALIDAD AUTOMÁTICA/MUERTE SEGURA

*/

// varía la dificultad en función de la edad especificada
// valores válidos: 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 y 14 (o más)
/*
varía la velocidad y, además:
- usuarios de 13, usan todas las palabras
- usuarios < 10, no usan nombres propios ni palabras del grupo "rare" (vid. más abajo)
- usuarios < 8, no usan palabras de más de 8 caracteres (o 3 sílabas)
- usuarios < 6, sólo usan palabras reales de menos de 5 caracteres
*/
var userAge = 15;

// letras, números y símbolos que pueden aparecer en el juego
var letras = "abcdefghijklmnñopqrstuvwxyz";
var numbers = "0123456789";
var symbols = ".,-/*$%&=¿?();:!¡";
// userAge 5 => letras
// userAge 6, 7 y 8 => nivel<7 letras; nivel>6 letras+letras+numbers
// userAge 9, 10 y 11 => nivel<5 letras; nivel<10 letras+numbers; nivel>9 letras+letras+numbers+mayúsculas
// userAge > 11 => nivel<5 letras; nivel<10 letras+numbers; nivel<15 letras+numbers+mayúsculas; nivel>14 letras+letras+numbers+mayúsculas+symbols

// A PARTIR DE AQUÍ, EDITAR LAS PALABRAS
// palabras agudas
var npf = 'galleta, gorila, laguna';
// palabras llanas
var npm = 'guindilla, aguacate, pingüino';
// palabras esdrujulas
var pfadj = 'vergüenza, juguetes, mago';
;