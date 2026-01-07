import { Worker } from "bullmq";
import { connection } from "./queue.js";

import splitPdf from "./jobs/splitPdf.js";
import compressPdf from "./jobs/compressPdf.js";
import imageToPdf from "./jobs/imageToPdf.js";
import imageConvert from "./jobs/imageConvert.js";
import pdfImageExtract from "./jobs/pdfImageExtract.js";
import imageCompress from "./jobs/imageCompress.js";

new Worker(
  "pdf-jobs",
  async (job) => {
    switch (job.name) {
      case "split": return splitPdf(job.data);
      case "compress": return compressPdf(job.data);
      case "image-to-pdf": return imageToPdf(job.data);
      case "image-convert": return imageConvert(job.data);
      case "pdf-image-extract": return pdfImageExtract(job.data);
      case "image-compress": return imageCompress(job.data);
      default: throw new Error("Unknown job");
    }
  },
  { connection }
);
