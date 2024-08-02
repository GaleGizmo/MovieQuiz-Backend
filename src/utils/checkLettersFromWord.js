/* eslint-disable no-undef */
function checkLettersFromWord (word, quote, lettersAlreadyFound) {
    let lettersFound = []
    
    for (const letter of word) {
        if (quote.includes(letter) && !lettersAlreadyFound.includes(letter)) {
            lettersFound.push(letter)
        }
    }
   
    return lettersFound
}
module.exports = checkLettersFromWord