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

export const generateSchedule = (scores: Scores, meetings: number) => {};
