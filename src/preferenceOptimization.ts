// Functions to Calculate Preference Scoring

interface Choices {
  [key: string]: string[];
}

interface Groups {
  clients: Choices;
  companies: Choices;
}

export const preferenceScorer = (input: Groups) => {
  return true;
};
