const LETTERS_BY_FREQUENCY = [
  "E",
  "A",
  "O",
  "S",
  "N",
  "R",
  "I",
  "L",
  "D",
  "T",
  "C",
  "U",
  "M",
  "P",
  "B",
  "G",
  "V",
  "Y",
  "Q",
  "H",
  "F",
  "Z",
  "J",
  "Ñ",
  "X",
  "K",
  "W",
];

const LESS_FREQUENT_CONSONANTS = "QFZJÑXKW";

const LETTERS_EQUIVALENTS = {
      'á': 'a',
      'é': 'e',
      'í': 'i',
      'ó': 'o',
      'ú': 'u',
      'Á': 'A',
      'É': 'E',
      'Í': 'I',
      'Ó': 'O',
      'Ú': 'U'
    };

// Configuración de rachas
const MAX_STRIKE = 7;

// Configuración de intentos
const MIN_TRIES = 3;
const MAX_TRIES = 7;

// Configuración de palabras
const WORD_LENGTH = 5;

// Configuración de puntos
const WIN_BONUS_POINTS = 20;
const POINTS_PER_REMAINING_TRY = 10;

// Configuración de pistas
const CLUE_PRICES = { actor: 5, director: 5, letter: 20, lettersRight: 10 };
const CLUE_PRICES_LEGACY = { actor: 10, director: 10, letter: 30, lettersRight: 20 };
const LEGACY_PRICES_THRESHOLD = 96;
const BLOCKED_CLUES_PHRASE = 87;

// Mensajes de palabra inválida
const INVALID_WORD_MESSAGES = [
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
  "Tu autocorrector acaba de dimitir",
  "Menos mal que esto es anónimo...",
  "Skynet ha rechazado esa palabra",
  "Francamente, querida, ¿qué palabra es esa?",
  "¡No puedes pasar! (con esa palabra)",
  "Hakuna Matata no aplica a palabras inventadas",
  "Corre, Forrest, corre... a buscar otra palabra",
  "Tu profe de lengua está llorando en algún lugar",
  "¿Quieres que te pase el número de un logopeda?",
  "¿Seguro que el español es tu idioma nativo?",
  "Esa no es la palabra que buscamos",
  "Hasta los minions escriben mejor",
  "Casi cuela. Casi",
  "En el diccionario buscar mejor tú debes",
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

module.exports = {
  LETTERS_BY_FREQUENCY,
  LESS_FREQUENT_CONSONANTS,
  LETTERS_EQUIVALENTS,
  MAX_STRIKE,
  MIN_TRIES,
  MAX_TRIES,
  WORD_LENGTH,
  WIN_BONUS_POINTS,
  POINTS_PER_REMAINING_TRY,
  CLUE_PRICES,
  CLUE_PRICES_LEGACY,
  LEGACY_PRICES_THRESHOLD,
  BLOCKED_CLUES_PHRASE,
  INVALID_WORD_MESSAGES,
};