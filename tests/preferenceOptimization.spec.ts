//Imports
import {
  preferenceScorer,
  generateSchedule
} from "../src/preferenceOptimization";
import { expect } from "chai";
import "mocha";

const deepEqualInAnyOrder = require("deep-equal-in-any-order");
const chai = require("chai");

chai.use(deepEqualInAnyOrder);

const isScheduleFull = (scheduleArray: any) => {
  let numberOfCompanies;

  //For Each Timeslot
  for (let i = 0; i < scheduleArray.length; i++) {
    const timeslot = scheduleArray[i];

    //Check Number of Companies are the Same or Establish Check
    const companiesCount = Object.keys(timeslot).length;
    if (!numberOfCompanies) {
      numberOfCompanies = companiesCount;
    } else if (numberOfCompanies !== companiesCount) {
      return false;
    }

    //Check Each Company has a Client That has a String of at least one character
    for (const company in timeslot) {
      if (timeslot.hasOwnProperty(company)) {
        const client = timeslot[company];
        if (typeof client !== "string" || client.length < 1) {
          return false;
        }
      }
    }
  }
  return true;
};

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
  let output = undefined as any;
  const meetings = 2;

  before(() => {
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

    output = generateSchedule(input, meetings);
  });

  /*
      Companies must have a full schedule
      Score must be maximised
    */

  // const example_expected = {
  //   schedule: [
  //     {
  //       companyA: "clientA",
  //       companyB: "clientB",
  //       companyC: "clientC"
  //     },
  //     {
  //       companyA: "clientC",
  //       companyB: "clientA",
  //       companyC: "clientB"
  //     }
  //   ],
  //   matching_score_totals: {
  //     companyA: 5,
  //     companyB: 6,
  //     companyC: 4
  //   },
  //   student_schedules: {
  //     clientA: ["companyA", "companyB"],
  //     clientB: ["companyB", "companyC"],
  //     clientC: ["companyC", "companyA"]
  //   }
  // };

  it("Has a Schedule of Correct Typings", () => {
    expect(output.schedule !== undefined).to.be.true;
    expect(output.schedule).to.be.a("array");
  });

  it("Has a Schedule of Correct Length", () => {
    expect(output.schedule.length).to.equal(meetings);
  });

  it("Check all Companies are in the Generated Schedule", () => {
    output.schedule.forEach((timeslot: any) => {
      expect(Object.keys(timeslot).sort()).to.deep.equal([
        "companyA",
        "companyB",
        "companyC"
      ]);
    });
  });

  it("Check all Scores are Sensible Numbers", () => {
    for (const company in output.matching_score_totals) {
      if (output.matching_score_totals.hasOwnProperty(company)) {
        const score = output.matching_score_totals[company];
        expect(score).to.be.a("number");
        expect(score >= 0).to.be.true;
        expect(score <= 99).to.be.true;
      }
    }
  });

  it("Check All Expected Companies Have a Total Score", () => {
    expect(Object.keys(output.matching_score_totals).sort()).to.deep.equal([
      "companyA",
      "companyB",
      "companyC"
    ]);
  });

  it("Given a Set of Scores, Return the Optimal Setting for 2 Maximum Possible Matches", () => {
    const totalScore = Object.values(output.matching_score_totals).reduce(
      (tot: any, c: any) => {
        return tot + c;
      },
      0
    );

    expect(isScheduleFull(output.schedule)).to.be.true;
    expect(output.schedule.length).to.equal(2);
    expect(totalScore).to.equal(15);
  });

  describe("Student Schedules", () => {
    it("Will Generate Schedules for Students", () => {
      expect(output.student_schedules !== undefined).to.be.true;
    });
  });
});
