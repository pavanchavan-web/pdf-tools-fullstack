import PQueue from "p-queue";

export const jobQueue = new PQueue({
  concurrency: 1,        // ✅ safest for Sharp + ImageMagick
  intervalCap: 2,        // ✅ avoids CPU spikes
  interval: 1000,
  carryoverConcurrencyCount: true,
});
