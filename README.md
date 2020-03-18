# preference_optimization

Given a top N list of preferences between lists A &amp; B and X maximum matches, maximise...something.

## Download

This is a typescript package, but should be interoperable with Javascript.
Check out this package on [npmjs.com](https://www.npmjs.com/package/preference_optimization)

## Example of Use

```javascript
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

const outputExpectedToBeSimilarTo = {
  schedule: [
    { companyA: "clientA", companyB: "clientB", companyC: "clientC" },
    { companyB: "clientA", companyC: "clientB", companyA: "clientC" }
  ],
  matching_score_totals: {
    facilitators: { companyA: 5, companyB: 6, companyC: 4 },
    participants: { clientA: 7, clientB: 5, clientC: 3 }
  },
  participant_schedules: {
    clientA: ["companyA", "companyB"],
    clientB: ["companyB", "companyC"],
    clientC: ["companyC", "companyA"]
  },
  facilitator_schedules: {
    companyA: ["clientA", "clientC"],
    companyB: ["clientB", "clientA"],
    companyC: ["clientC", "clientB"]
  }
};
```

### "Expected to Be Similar To"? That Looks Like an Impure Function!!!

Yes, this library uses a MonteCarlo shuffling system to decide which matches get priority ("first dibs") with each schedule timeslot that gets filled with matches.

### So what does it optimise for? And How?

See below for 'what' the optimisation process seeks to find, but specifically, the algorithm generates 20 random outcomes and picks the best one.

## Explanation of Problem

This problem came about when I was involved in a 'Speed Dating-esque' recruiting event.

One would read about the companies beforehand and make a ranked preference order choice, the companies would do the same for the candidates. Then a schedule was drawn up for 8 possible sessions.

Apparently this process was done manually in a very tedious Excel process, so I decided to build a system that would automatically produce an optimum result.

Naturally, the 'optimum result' may be different depending on your point of view, but one would assume that the following would apply:

1. 📅 All possible sessions should be filled, even if the matching is not optimal (in this example: the companies are guests, so should therefore see as many job-seekers as they can)
2. 🗳️ Ranked order preference is respected in that a weight can be given to the ranking, and perhaps for mutual matches.

I'm hoping to build a somewhat generalised system that allows the tweaking of scoring biases and other parameters so that this can act as a library for similar problems.

## Code

The code is written in Typescript.  
I intend for the outside of the function to not show this, but internally the terms `Dogs🐶` and `Cats🐱` are used quite a lot.

- `Dogs` refers to the Companies in the Problem Example, the main schedule and scores are generated from the perspectives of the dogs, when building the schedule, dogs will always be given a full schedule (if possible)
- `Cats` refers to the Job-seekers in the Problem Example. I intend for them to be given a separate 'cat-specific' version of the schedule, but as a result of the scheduling, cats may end up with empty slots in their schedules 🙀

I used these terms because they're shorter, more fun and a little less hard to read than `Companies` and `Job-seekers` or `Clients` 😹

## Running Tests Locally

Install Dependancies with `yarn`
Run Tests with `yarn test`
