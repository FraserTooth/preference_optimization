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

          //Add Standard Score for Cats with Current Dog
          if (catsChoices.includes(dog)) {
            output[dog][cat] = 1;
          } else {
            //Or Set to Zero
            output[dog][cat] = 0;
          }
        }
      }

      //Check Dog's Choices
      for (let i = 0; i < dogsCatChoices.length; i++) {
        const dogsCatChoice = dogsCatChoices[i];

        // const score = choicesA.length - i;
        const catsChoices = cats[dogsCatChoice];

        //If Match, Double Score
        if (catsChoices.includes(dog)) {
          output[dog][dogsCatChoice] = 2;
        } else {
          //If Not Match, Standard Score
          output[dog][dogsCatChoice] = 1;
        }
      }
    }
  }

  return output;
};
