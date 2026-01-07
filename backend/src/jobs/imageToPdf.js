import fs from "fs";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export default async ({ files }) => {
  const pdf = await PDFDocument.create();

  for (const f of files) {
    const img = await sharp(f).png().toBuffer();
    const emb = await pdf.embedPng(img);
    const p = pdf.addPage([emb.width, emb.height]);
    p.drawImage(emb, { x:0,y:0,width:emb.width,height:emb.height });
    fs.unlinkSync(f);
  }

  const out = `outputs/images-${Date.now()}.pdf`;
  fs.writeFileSync(out, await pdf.save());
  return { output: out };
};
