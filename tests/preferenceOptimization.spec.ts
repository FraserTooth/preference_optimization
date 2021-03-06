//Imports
import {
  preferenceScorer,
  generateSchedule,
  buildScheduleFromScores
} from "../src/preferenceOptimization";
import { expect } from "chai";
import "mocha";
import { describe } from "mocha";

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

    console.log(output);
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
  //     facilitators: {
  //       companyA: 5,
  //       companyB: 6,
  //       companyC: 4,
  //     },
  //     participants: {
  //       clientA: 9,
  //       clientB: 9,
  //       clientC: 9
  //     }
  //   },
  //   participant_schedules: {
  //     clientA: ["companyA", "companyB"],
  //     clientB: ["companyB", "companyC"],
  //     clientC: ["companyC", "companyA"]
  //   },
  //   facilitator_schedules: {
  //     companyA: ["clientA", "clientC"],
  //     companyB: ["clientB", "clientA"],
  //     companyC: ["clientC", "clientB"]
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
    const companyScores = output.matching_score_totals.facilitators;
    for (const company in companyScores) {
      if (companyScores.hasOwnProperty(company)) {
        const score = companyScores[company];
        expect(score).to.be.a("number");
        expect(score >= 0).to.be.true;
        expect(score <= 99).to.be.true;
      }
    }
  });

  it("Check All Expected Companies Have a Total Score", () => {
    expect(
      Object.keys(output.matching_score_totals.facilitators).sort()
    ).to.deep.equal(["companyA", "companyB", "companyC"]);
  });

  it("Check All Expected Clients Have a Total Score", () => {
    expect(
      Object.keys(output.matching_score_totals.participants).sort()
    ).to.deep.equal(["clientA", "clientB", "clientC"]);
  });

  it("Given a Set of Scores, Return the Optimal Setting for 2 Maximum Possible Matches", () => {
    const totalScore = Object.values(
      output.matching_score_totals.facilitators
    ).reduce((tot: any, c: any) => {
      return tot + c;
    }, 0);

    expect(isScheduleFull(output.schedule)).to.be.true;
    expect(output.schedule.length).to.equal(2);
    expect(totalScore).to.equal(15);
  });

  describe("Client Schedules", () => {
    it("Will Generate Schedules for Client", () => {
      expect(output.participant_schedules !== undefined).to.be.true;
      expect(output.participant_schedules).to.be.an("object");
    });

    it("Will generate a schedule for all Clients", () => {
      expect(Object.keys(output.participant_schedules).sort()).to.deep.equal([
        "clientA",
        "clientB",
        "clientC"
      ]);
    });

    it("Will Generate a valid schedule for all clients", () => {
      for (const client in output.participant_schedules) {
        if (output.participant_schedules.hasOwnProperty(client)) {
          const schedule = output.participant_schedules[client];

          expect(schedule).to.be.an("array");

          expect(schedule.length).to.equal(2);

          expect(schedule[0]).to.be.a("string");
          expect(schedule[0].length).to.equal(8);
          expect(schedule[0].substring(0, 7)).to.equal("company");

          expect(schedule[1]).to.be.a("string");
          expect(schedule[1].length).to.equal(8);
          expect(schedule[1].substring(0, 7)).to.equal("company");
        }
      }
    });
  });

  describe("Company Schedules", () => {
    it("Will Generate Schedules for Company", () => {
      expect(output.facilitator_schedules !== undefined).to.be.true;
      expect(output.facilitator_schedules).to.be.an("object");
    });

    it("Will generate a schedule for all Companies", () => {
      expect(Object.keys(output.facilitator_schedules).sort()).to.deep.equal([
        "companyA",
        "companyB",
        "companyC"
      ]);
    });

    it("Will Generate a valid schedule for all Companies", () => {
      for (const company in output.facilitator_schedules) {
        if (output.facilitator_schedules.hasOwnProperty(company)) {
          const schedule = output.facilitator_schedules[company];

          expect(schedule).to.be.an("array");

          expect(schedule.length).to.equal(2);

          expect(schedule[0]).to.be.a("string");
          expect(schedule[0].length).to.equal(7);
          expect(schedule[0].substring(0, 6)).to.equal("client");

          expect(schedule[1]).to.be.a("string");
          expect(schedule[1].length).to.equal(7);
          expect(schedule[1].substring(0, 6)).to.equal("client");
        }
      }
    });
  });
});

const runFairnessTests = (result: any) => {
  //Score should have a small standard deviation

  //Companies should have a full schedule
  //No client scores should be vastly higher than others
  return result;
};

describe("End-to-end Tests", () => {
  it("Small End-to-end Test", () => {
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
    const meetings = 2;

    const output = buildScheduleFromScores(
      input.companies,
      input.clients,
      meetings
    );

    const totalScoreCompanies = Object.values(
      output.matching_score_totals.facilitators
    ).reduce((tot: any, c: any) => {
      return tot + c;
    }, 0);

    const totalScoreStudents = Object.values(
      output.matching_score_totals.facilitators
    ).reduce((tot: any, c: any) => {
      return tot + c;
    }, 0);

    expect(isScheduleFull(output.schedule)).to.be.true;
    expect(output.schedule.length).to.equal(meetings);
    expect(totalScoreCompanies).to.equal(15);
  });

  it("Big End-to-end Test", () => {
    const input = {
      clients: {
        fraser: ["moneytree", "zehitomo", "zaiko", "pivotal", "restar"],
        eri: ["makeleaps", "zaiko", "restar", "mercari", "code chrysalis"],
        yan: ["google", "restar", "makeleaps", "pivotal", "visual alpha"],
        vic: ["visual alpha", "google", "zehitomo", "moneytree", "pivotal"],
        steffie: ["code chrysalis", "restar", "google", "moneytree", "mercari"],
        dustin: ["google", "mercari", "moneytree", "zehitomo", "restar"],
        iku: ["pivotal", "restar", "code chrysalis", "zaiko", "moneytree"],
        jill: ["code chrysalis", "pivotal", "google", "restar", "mercari"],
        niklas: [
          "makeleaps",
          "google",
          "code chrysalis",
          "moneytree",
          "restar"
        ],
        felix: ["mercari", "google", "zehitomo", "visual alpha", "pivotal"],
        steve: ["google", "zehitomo", "restar", "mercari", "pivotal"],
        yu: ["zehitomo", "mercari", "code chrysalis", "makeleaps", "moneytree"]
      },
      companies: {
        moneytree: ["fraser", "vic", "dustin", "jill", "niklas"],
        "code chrysalis": ["steffie", "vic", "dustin", "felix", "yan"],
        "visual alpha": ["felix", "eri", "iku", "yan", "niklas"],
        mercari: ["jill", "eri", "fraser", "yan", "steffie"],
        zaiko: ["dustin", "steffie", "yan", "felix", "iku"],
        google: ["eri", "yan", "niklas", "vic", "steffie"],
        zehitomo: ["felix", "fraser", "jill", "iku", "vic"],
        pivotal: ["iku", "dustin", "vic", "steffie", "yan"],
        makeleaps: ["niklas", "felix", "iku", "eri", "fraser"],
        restar: ["vic", "steffie", "felix", "yan", "fraser"]
      }
    };
    const meetings = 8;

    const output = buildScheduleFromScores(
      input.companies,
      input.clients,
      meetings
    );

    const totalScoreCompanies = Object.values(
      output.matching_score_totals.facilitators
    ).reduce((tot: any, c: any) => {
      return tot + c;
    }, 0);

    const totalScoreStudents = Object.values(
      output.matching_score_totals.facilitators
    ).reduce((tot: any, c: any) => {
      return tot + c;
    }, 0);

    expect(isScheduleFull(output.schedule)).to.be.true;
    expect(output.schedule.length).to.equal(meetings);
    expect(totalScoreCompanies).to.be.greaterThan(0);
    expect(totalScoreStudents).to.be.greaterThan(0);
  });
});
