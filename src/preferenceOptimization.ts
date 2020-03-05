// Functions to Calculate Preference Scoring

// Yes the Use of Cats and Dogs is Silly, but its better than groupA and groupB

interface Choices {
  [chooser: string]: string[];
}

interface Matches {
  [match: string]: number;
}

interface Scores {
  [dog: string]: Matches;
}

export const preferenceScorer = (dogs: Choices, cats: Choices) => {
  const output = {} as Scores;

  //For Every Dog
  for (const dog in dogs) {
    if (dogs.hasOwnProperty(dog)) {
      const dogsCatChoices = dogs[dog];

      output[dog] = {} as Matches;

      //Represent All Cats in the Dog's Choices
      for (const cat in cats) {
        if (cats.hasOwnProperty(cat)) {
          const catsChoices = cats[cat];

          //Initialise Score
          if (!output[dog][cat]) {
            output[dog][cat] = 0;
          }

          const catsDogChoiceScore =
            catsChoices.indexOf(dog) != -1
              ? catsChoices.length - catsChoices.indexOf(dog)
              : 0;

          //Add Standard Score for Cats with Current Dog or Set to Zero
          output[dog][cat] += catsDogChoiceScore;
        }
      }

      //Check Dog's Choices
      for (let i = 0; i < dogsCatChoices.length; i++) {
        const dogsCatChoice = dogsCatChoices[i];

        const dogsCatChoiceScore = dogsCatChoices.length - i;
        // const catsChoices = cats[dogsCatChoice];

        //Add Score to Array
        output[dog][dogsCatChoice] += dogsCatChoiceScore;
      }
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

interface NewMatches {
  name: string;
  score: number;
}

interface NewScores {
  name: string;
  scores: NewMatches[];
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

export const generateSchedule = (scores: NewScores[], meetings: number) => {
  const output = {
    schedule: [] as Timeslot[],
    matching_score_totals: {} as ScoreTotals
  };

  //Initialise Dog and Cat Schedules and Score Totals
  const dogsTotalSchedule = {} as Schedule;
  const catsTotalSchedule = {} as Schedule;

  // For Every Timeslot
  for (let slot = 0; slot < meetings; slot++) {
    const timeslot = {} as Timeslot;
    const chosenCatsThisTimeslot = [] as string[];

    //While there isn't a solution
    while (Object.keys(timeslot).length < Object.keys(scores).length) {
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
