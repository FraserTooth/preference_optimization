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
    const expected = {
      companyA: {
        clientA: 4,
        clientB: 1,
        clientC: 1
      },
      companyB: {
        clientA: 3,
        clientB: 3,
        clientC: 0
      },
      companyC: {
        clientA: 2,
        clientB: 2,
        clientC: 2
      }
    };

    expect(output).to.deep.equal(expected);
  });
});

describe("Schedule Arrangement", () => {
  it("Given a Set of Scores, Return the Optimal Setting for 2 Maximum Possible Matches", () => {
    const input = {
      companyA: {
        clientA: 4,
        clientB: 1,
        clientC: 1
      },
      companyB: {
        clientA: 3,
        clientB: 3,
        clientC: 0
      },
      companyC: {
        clientA: 2,
        clientB: 2,
        clientC: 2
      }
    };

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
