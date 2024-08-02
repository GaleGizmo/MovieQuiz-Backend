/* eslint-disable no-undef */
function checkEndGame  (phraseStatus,  currentTries, maxTries)  {
    
      if (!phraseStatus.includes("_") && currentTries <= maxTries) {
        
        return "win";}
      if (phraseStatus.includes("_") && currentTries === maxTries) {
       
        return "lose";
      }
      
      return "";
    }
    module.exports = checkEndGame;
    