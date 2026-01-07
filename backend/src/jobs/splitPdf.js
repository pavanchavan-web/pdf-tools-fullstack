import fs from "fs";
import archiver from "archiver";
import { PDFDocument } from "pdf-lib";

export default async ({ filePath }) => {
  const pdf = await PDFDocument.load(fs.readFileSync(filePath));
  const out = `outputs/split-${Date.now()}.zip`;
  const zip = archiver("zip");
  zip.pipe(fs.createWriteStream(out));

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const doc = await PDFDocument.create();
    const [p] = await doc.copyPages(pdf, [i]);
    doc.addPage(p);
    zip.append(Buffer.from(await doc.save()), { name: `page-${i+1}.pdf` });
  }

  await zip.finalize();
  fs.unlinkSync(filePath);
  return { output: out };
};
