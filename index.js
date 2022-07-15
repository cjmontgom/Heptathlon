const fs = require("fs");
const { calculate, turnIntoBeautifulTables } = require("./calculator");

// recieve csv filename as command line argument
const args = process.argv.slice(2);
const csvFile = args[0];

fs.readFile(csvFile, "utf8", function (err, data) {
  if (err) throw `There was an error reading your file. ERROR: ${err}`;
  const calculatedScores = calculate(data);
  const formattedScores = turnIntoBeautifulTables(calculatedScores);
  console.log(formattedScores);
});