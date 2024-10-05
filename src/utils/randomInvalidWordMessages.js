/* eslint-disable no-undef */
const invalidWordMessages = [
    "¡Esa palabra no está ni en la Wikipedia!",
    "Le llamas palabra a cualquier cosa",
    "Buen intento, máquina. Prueba de nuevo",
    "Eso no cuenta como palabra, intenta otra",
    "Tremendo INVENT, por favor",
    "¿Ya estamos inventando palabritas?",
    "Creo que algo le pasa a tu teclado",
    "¿Tienes algo personal contra la RAE?",
    "Ni en el diccionario, ni en tus sueños",
    "¡Buena imaginación, pero no cuela!",
    "Esa palabra en una galaxia lejana, tal vez",
    "Deja la creatividad para otro juego",
    "¿Así escribes tú? Qué interesante",
    "Skynet ha rechazado esa palabra",
    "Francamente, querida, ¿qué palabra es esa?",
    "Esa no es la palabra que buscamos",
    "Siempre nos quedará... Otra palabra",
    "Houston, tenemos un palabro",
    "Esa palabra está más perdida que Nemo",
    "He visto palabras que no creeríais",
    "Tu falta de léxico resulta molesta",
    "Ni Mary Poppins aceptaría esa palabra",
    "Qué bien si existiera esa palabra, ¿eh?",
    "Esa palabra hace llorar a Pérez Reverte",
    "¿Qué es eso? ¿Escritura creativa?",
    "¡Sigue probando, sigue probando!",
    "¡Claro que sí! ¿Qué sabrá la RAE?",
    
  ];
  

const getRandomInvalidWordMessage = () => {
    const randomIndex = Math.floor(Math.random() * invalidWordMessages.length);
    return invalidWordMessages[randomIndex];
  };
module.exports= getRandomInvalidWordMessage;