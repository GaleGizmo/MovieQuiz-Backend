/* eslint-disable no-undef */
function isSpecialDate (){
const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
if (day === 28 && month === 12) {
  return true;
} else {
  return false;
}
}
module.exports= {isSpecialDate}