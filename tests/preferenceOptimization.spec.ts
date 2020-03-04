//Imports
import { preferenceScorer } from "../src/preferenceOptimization";
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

    const expected = {
      companyA: {
        clientA: 2,
        clientB: 1,
        clientC: 1
      },
      companyB: {
        clientA: 2,
        clientB: 2,
        clientC: 0
      },
      companyC: {
        clientA: 1,
        clientB: 2,
        clientC: 1
      }
    };

    expect(output).to.deep.equal(expected);
  });
});
