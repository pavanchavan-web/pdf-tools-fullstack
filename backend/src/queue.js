import PQueue from "p-queue";

export const jobQueue = new PQueue({
  concurrency: 4,
  intervalCap: 10,
  interval: 1000,
});
