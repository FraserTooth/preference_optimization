//Imports
import {
  preferenceScorer,
  generateSchedule
} from "../src/preferenceOptimization";
import { expect } from "chai";
import "mocha";

describe("Preference Scoring", () => {
  it("Match 3 Clients and 3 Companies for Top Two Choices and Two Available Slots", () => {
    const input = {
      clients: {
        clientA: ["companyA", "companyB"],
        clientB: ["companyB", "companyC"],
        clientC: ["companyC", "companyA"]
      },
      companies: {
        companyA: ["clientA", "clientB"],
        companyB: ["clientA", "clientB"],
        companyC: ["clientA", "clientB"]
      }
    };

    const output = preferenceScorer(input.companies, input.clients);

    /*
      For no match: 0
      For preference order match: (choices.length - 1)
      For two way match (preferenceOrderClient + prederenceOrderCompany)
    */
    const expected = [
      {
        name: "companyA",
        scores: [
          { name: "clientA", score: 4 },
          { name: "clientB", score: 1 },
          { name: "clientC", score: 1 }
        ]
      },
      {
        name: "companyB",
        scores: [
          { name: "clientA", score: 3 },
          { name: "clientB", score: 3 },
          { name: "clientC", score: 0 }
        ]
      },
      {
        name: "companyC",
        scores: [
          { name: "clientA", score: 2 },
          { name: "clientB", score: 2 },
          { name: "clientC", score: 2 }
        ]
      }
    ];

    expect(output).to.deep.equal(expected);
  });
});

describe("Schedule Arrangement", () => {
  it("Given a Set of Scores, Return the Optimal Setting for 2 Maximum Possible Matches", () => {
    const input = [
      {
        name: "companyA",
        scores: [
          { name: "clientA", score: 4 },
          { name: "clientB", score: 1 },
          { name: "clientC", score: 1 }
        ]
      },
      {
        name: "companyB",
        scores: [
          { name: "clientA", score: 3 },
          { name: "clientB", score: 3 },
          { name: "clientC", score: 0 }
        ]
      },
      {
        name: "companyC",
        scores: [
          { name: "clientA", score: 2 },
          { name: "clientB", score: 2 },
          { name: "clientC", score: 2 }
        ]
      }
    ];

    const meetings = 2;

    const output = generateSchedule(input, meetings);

    /*
      Companies must have a full schedule
    */
    const expected = {
      schedule: [
        {
          companyA: "clientA",
          companyB: "clientB",
          companyC: "clientC"
        },
        {
          companyA: "clientC",
          companyB: "clientA",
          companyC: "clientB"
        }
      ],
      matching_score_totals: {
        companyA: 5,
        companyB: 6,
        companyC: 4
      }
    };

    expect(output).to.deep.equal(expected);
  });
});
