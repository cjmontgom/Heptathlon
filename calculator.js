

function trimEmptyRecords(records) {
  return records.filter((record) => record.trim().length > 0);
}

function organiseEntriesByDate(dataEntriesArr) {
  return dataEntriesArr.reduce((prev, record) => {
    const splitByComma = record.split(",");
    const dateOfRecord = new Date(splitByComma.pop()).toDateString();

    return [
      ...prev,
      {
        date: dateOfRecord,
        results: [splitByComma],
      },
    ];
  }, []);
}

function consolidateEntriesByDate(entriesByDate) {
  let consolidated = [];

  entriesByDate.forEach((currentRecord, index) => {
    let recordAdded = false;

    if (index === 0) {
      consolidated.push(currentRecord);
      recordAdded = true;
    } else {
      for (let i = 0; i < consolidated.length; i++) {
        if (currentRecord.date === consolidated[i].date) {
          consolidated[i].results.push(currentRecord.results[0]);
          recordAdded = true;
          break;
        }
      }
    }

    if (!recordAdded) {
      consolidated.push(currentRecord);
    }
  });

  return consolidated;
}

function trimStrings(h, m) {
  let measurement = m.toLowerCase().trim();
  let hepEvent = h.toLowerCase().trim();

  // remove suffix
  if (m.includes("s") || m.includes("m"))
    measurement = measurement.slice(0, -1);

  return { hepEvent, measurement };
}

function formatRunningMeasurement(m) {
  if (!m.includes(":")) {
    return m;
  }

  [minutes, seconds] = m.split(":");
  return parseFloat(minutes) * 60 + parseFloat(seconds);
}

function formatJumpingMeasurement(m) {
  [meters, cm] = m.split(".");
  return parseFloat(meters) * 100 + parseFloat(cm);
}

function scoreCalculatorExtravaganza(h, m) {
  const { hepEvent, measurement } = trimStrings(h, m);

  let score;

  switch (hepEvent) {
    case "200m":
      score = 4.99087 * (42.5 - formatRunningMeasurement(measurement)) ** 1.81;
      break;
    case "800m":
      score = 0.11193 * (254 - formatRunningMeasurement(measurement)) ** 1.88;
      break;
    case "100m":
      score = 9.23076 * (26.7 - formatRunningMeasurement(measurement)) ** 1.835;
      break;
    case "high":
      score = 1.84523 * (formatJumpingMeasurement(measurement) - 75) ** 1.348;
      break;
    case "long":
      score = 0.188807 * (formatJumpingMeasurement(measurement) - 210) ** 1.41;
      break;
    case "shot":
      score = 56.0211 * (parseInt(measurement) - 1.5) ** 1.05;
      break;
    case "javelin":
      score = 15.9803 * (parseInt(measurement) - 3.8) ** 1.04;
      break;
    default:
      break;
  }

  return Math.floor(score); //rounded down to integer
}

function calculateScores(consolidateEntriesByDate) {
  const scoredEntries = [];

  consolidateEntriesByDate.forEach((entry) => {
    const scoredResults = entry.results.map((result) => {
      const athlete = result[0];
      const hepEvent = result[1];
      const measurement = result[2];

      const score = scoreCalculatorExtravaganza(hepEvent, measurement);

      return { athlete, score };
    });
    scoredEntries.push({ date: entry.date, results: scoredResults });
  });

  return scoredEntries;
}

function accumulateAthleteDailyScore(scoredEntries) {
  return scoredEntries.map((day) => {
    let accumulatedScores = [];

    day.results.forEach((result, index) => {
      const capitalisedResult = {
        ...result,
        athlete: result.athlete.toUpperCase(),
      };

      if (index === 0) {
        accumulatedScores.push(capitalisedResult);
      } else {
        const athleteAlreadyExists = accumulatedScores.find(
          (accumulatedResult) =>
            capitalisedResult.athlete === accumulatedResult.athlete
        );

        if (athleteAlreadyExists) {
          const indexOfAthlete =
            accumulatedScores.indexOf(athleteAlreadyExists);
          accumulatedScores[indexOfAthlete].score =
            accumulatedScores[indexOfAthlete].score + capitalisedResult.score;
        } else {
          accumulatedScores.push(capitalisedResult);
        }
      }
    });
    return { ...day, results: [...accumulatedScores] };
  });
}

function sortScoresIntoDescOrder(accDailyScores) {
  return accDailyScores.map((day) => {
    const sortedScores = day.results
      .sort((a, b) => {
        return a.score - b.score;
      })
      .reverse();

    return { ...day, results: sortedScores };
  });
}

function calculate(string) {
  const dataEntriesArr = string.split("\n");

  const trimmedData = trimEmptyRecords(dataEntriesArr);

  const entriesByDate = organiseEntriesByDate(trimmedData);

  const entriesConsolidatedByDate = consolidateEntriesByDate(entriesByDate);

  const scoredEntries = calculateScores(entriesConsolidatedByDate);

  const accDailyScores = accumulateAthleteDailyScore(scoredEntries);

  const sortedDescScores = sortScoresIntoDescOrder(accDailyScores);

  return sortedDescScores;
}

function turnIntoBeautifulTables(data) {
  let beautifiedData = ``;

  data.forEach((day, index) => {
    let table = `
------------------------
 Day ${index + 1}: ${day.date}
------------------------
        `;
    day.results.forEach((result) => {
      table =
        table +
        `
${result.athlete}    ${result.score}          
            `;
    });

    beautifiedData = beautifiedData + table;
  });

  return beautifiedData;
}

module.exports = { calculate, turnIntoBeautifulTables };
