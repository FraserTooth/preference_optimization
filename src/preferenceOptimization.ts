// Functions to Calculate Preference Scoring

// Yes the Use of Cats and Dogs is Silly, but its better than groupA and groupB
import * as _ from "lodash";

interface Choices {
  [chooser: string]: string[];
}

interface Matches {
  name: string;
  score: number;
}

interface Scores {
  name: string;
  scores: Matches[];
}

export const preferenceScorer = (dogs: Choices, cats: Choices) => {
  const output = [] as Scores[];

  //For Every Dog
  for (const dog in dogs) {
    if (dogs.hasOwnProperty(dog)) {
      const dogsCatChoices = dogs[dog];

      const dogObject = {
        name: dog,
        scores: [] as Matches[]
      } as Scores;

      //Represent All Cats
      for (const cat in cats) {
        if (cats.hasOwnProperty(cat)) {
          const catsChoices = cats[cat];

          const catScore = {
            name: cat,
            score: 0
          } as Matches;

          const catsDogChoiceScore =
            catsChoices.indexOf(dog) != -1
              ? catsChoices.length - catsChoices.indexOf(dog)
              : 0;

          const dogsCatChoiceScore =
            dogsCatChoices.indexOf(cat) != -1
              ? dogsCatChoices.length - dogsCatChoices.indexOf(cat)
              : 0;

          //Add Standard Score for Cats with Current Dog or Set to Zero
          catScore.score += catsDogChoiceScore + dogsCatChoiceScore;

          dogObject.scores.push(catScore);
        }
      }
      output.push(dogObject);
    }
  }
  return output;
};

interface Timeslot {
  [dog: string]: string;
}

interface ScoreTotals {
  [dog: string]: number;
}

interface Schedule {
  [dog: string]: string[];
}

interface ScheduleOutputObject {
  schedule: Timeslot[];
  matching_score_totals: ScoreTotals;
}

function shuffleArray(array: any[]) {
  let currentIndex = array.length as number;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const generateSchedule = (
  scores: Scores[],
  meetings: number,
  numberOfShuffles = 10 as number
) => {
  const listOfPossibleSchedules = [] as ScheduleOutputObject[];

  //Run the Generator X Times
  for (let x = 0; x < numberOfShuffles; x++) {
    const round = generateOneRoundOfSchedules(scores, meetings);
    listOfPossibleSchedules.push(round);
  }

  //Return the one with the highest total matching score that has the most schedules
  const bestOutcome = listOfPossibleSchedules.reduce(
    (best: any, current: any) => {
      //Calculate Number of Meetings Scheduled
      const meetingsScheduledBest = best
        ? _.sum(
            best.schedule.map((timeslot: any) => Object.keys(timeslot).length)
          )
        : 0;

      const meetingsScheduledCurrent = _.sum(
        current.schedule.map((timeslot: any) => Object.keys(timeslot).length)
      );

      //Return if current has more meetings
      if (meetingsScheduledCurrent > meetingsScheduledBest) {
        return current;
      } else if (meetingsScheduledCurrent < meetingsScheduledBest) {
        return best;
      }

      const bestTotal = best
        ? _.sum(Object.values(best.matching_score_totals))
        : 0;
      const currentTotal = _.sum(Object.values(current.matching_score_totals));

      return currentTotal > bestTotal ? current : best;
    },
    null
  );

  return bestOutcome;
};

const generateOneRoundOfSchedules = (scores: Scores[], meetings: number) => {
  const output = {
    schedule: [],
    matching_score_totals: {}
  } as ScheduleOutputObject;

  //Initialise Dog and Cat Schedules and Score Totals
  const dogsTotalSchedule = {} as Schedule;
  const catsTotalSchedule = {} as Schedule;

  // For Every Timeslot
  for (let slot = 0; slot < meetings; slot++) {
    const timeslot = {} as Timeslot;
    const chosenCatsThisTimeslot = [] as string[];

    //While there isn't a solution, try 10 times
    for (let n = 0; n < 10; n++) {
      // For Every Dog
      for (let i = 0; i < scores.length; i++) {
        const dog = scores[i];

        //Intialise Dogs Total Schedule if it doesn't already exist
        if (!dogsTotalSchedule[dog.name]) {
          dogsTotalSchedule[dog.name] = [];
        }

        //Intialise Dogs Total Score if it doesn't already exist
        if (!output.matching_score_totals[dog.name]) {
          output.matching_score_totals[dog.name] = 0;
        }

        //Get Values and Sort Array in Order of Score
        const catScoresArray = dog.scores;
        catScoresArray.sort((a, b) => b.score - a.score);

        //For List of Sorted Cats
        for (let j = 0; j < catScoresArray.length; j++) {
          const cat = catScoresArray[j];

          //Find Best Cat that Hasn't Already Been Matched with this dog and hasnt been matched with anyone else this round
          if (
            !dogsTotalSchedule[dog.name].includes(cat.name) &&
            !chosenCatsThisTimeslot.includes(cat.name)
          ) {
            //Add to Dogs Entry for Current TimeSlot
            timeslot[dog.name] = cat.name;
            chosenCatsThisTimeslot.push(cat.name);
            dogsTotalSchedule[dog.name].push(cat.name);
            output.matching_score_totals[dog.name] += cat.score;
            break;
          }
        }
      }
      //Shuffle Order of Dogs
      scores = shuffleArray(scores);
    }

    output.schedule.push(timeslot);
  }
  return output;
};
