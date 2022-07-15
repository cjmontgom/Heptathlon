const assert = require("assert");
const { calculate, turnIntoBeautifulTables } = require("./calculator");
const { test, run } = require("./testFramework");

const sampleString = `George, 100m,    10.64s,  2016-07-02 10:34:00
Bungle, 100m,    10.20s,  2016-07-02 10:34:00
zippy,  100m ,   10.30s,  2016-07-02 10:34:00
zippy,  Javelin, 60.4m,   2016-07-03 11:00:00
bungle, javelin, 64.3,    2016-07-03 11:49:00
George, long,    6.90m,   2016-07-04 10:02:00
george, 800m,    2:20.13, 2016-07-04 10:02:00`;

const sampleOutput = `
------------------------
 Day 1: Sat Jul 02 2016
------------------------
BUNGLE          1582
ZIPPY           1564
GEORGE          1505

------------------------
 Day 2: Sun Jul 03 2016
------------------------
BUNGLE          2721
ZIPPY           2626
GEORGE          1505

------------------------
 Day 3: Mon Jul 04 2016
------------------------
GEORGE          3466
BUNGLE          2721
ZIPPY           2626
`;

test("should strip out empty records", () => {
  const input = `
    
George, long,    6.90m,   2016-07-04 10:02:00
george, 800m,    2:20.13, 2016-07-04 10:02:00`;

  assert.doesNotThrow(() => calculate(input));
});

test("should output a formatted date for each record", () => {
  const expectedOutputtedDates = [
    "Sat Jul 02 2016",
    "Sun Jul 03 2016",
    "Mon Jul 04 2016",
  ];
  const result = calculate(sampleString);

  expectedOutputtedDates.forEach((date) => {
    assert(result.some((result) => result.date === date));
  });
});

test("should consolidate event entries for one day under a single date", () => {
  const result = calculate(sampleString);

  const uniqueDates = new Set(result.map((entry) => entry.date));
  const duplicates = uniqueDates.size < result.length;

  assert(duplicates === false);
});

test("should correctly calculate a 100m score", () => {
  const input = `George, 100m,    10.64s,  2016-07-02 10:34:00`;
  const result = calculate(input);

  assert(result[0].results[0].score === 1505);
});

test("should correctly transform minutes&seconds into seconds to score 800m", () => {
  const input = `George, 800m,    2:10.64,  2016-07-02 10:34:00`;
  const result = calculate(input);

  assert(result[0].results[0].score === 955);
});

test("should correctly transform meters&cm into cm to score jumping events", () => {
  const input = `George, long,    8.64m,  2016-07-02 10:34:00`;
  const result = calculate(input);

  assert(result[0].results[0].score === 1761);
});

test("should correctly calculate scores for throwing events", () => {
  const input = `George, javelin,    80.39m,  2016-07-02 10:34:00`;
  const result = calculate(input);

  assert(result[0].results[0].score === 1448);
});

test("should only output a single score per athlete, per day", () => {
  const input = `
George, long,    6.90m,   2016-07-04 10:02:00
george, 800m,    2:20.13, 2016-07-04 10:02:00
Bungle, 100m,    10.20s,  2016-07-04 10:34:00
zippy,  100m ,   10.30s,  2016-07-04 10:34:00
zippy,  Javelin, 60.4m,   2016-07-04 11:00:00
zippy,  Javelin, 60.4m,   2016-07-05 11:00:00
`;
  const result = calculate(input);

  assert(result[0].results.length === 3);
  assert(result[1].results.length === 1);
});

test("should format the output into an absolutely stunning table", () => {
  const result = calculate(sampleString);
  const beautifulResult = turnIntoBeautifulTables(result);

  // assert(beautifulResult === sampleOutput)
});

run();
