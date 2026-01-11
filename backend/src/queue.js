import PQueue from "p-queue";

export const jobQueue = new PQueue({
  concurrency: 2,        // ✅ safest for Sharp + ImageMagick
  intervalCap: 4,        // ✅ avoids CPU spikes
  interval: 1000,
});
