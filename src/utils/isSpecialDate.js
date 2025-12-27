/* eslint-disable no-undef */
function isSpecialDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  if (day === 6 && month === 1) {
    return "reyes";
  }
  //  else if (day === 28 && month === 12) {
  //   return "inocentes";
  // }
  else {
    return "normal";
  }
}
module.exports = { isSpecialDate };
