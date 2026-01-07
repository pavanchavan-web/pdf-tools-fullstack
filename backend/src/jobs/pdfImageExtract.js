import fs from "fs";
import { exec } from "child_process";
import archiver from "archiver";

export default async ({ filePath }) => {
  const dir = `extract-${Date.now()}`;
  const out = `outputs/pdf-images-${Date.now()}.zip`;
  fs.mkdirSync(dir);

  await new Promise((r,j)=>exec(`pdfimages -all "${filePath}" "${dir}/img"`,e=>e?j(e):r()));

  const zip = archiver("zip");
  zip.pipe(fs.createWriteStream(out));
  fs.readdirSync(dir).forEach(f => zip.file(`${dir}/${f}`,{name:f}));
  await zip.finalize();

  fs.rmSync(dir,{recursive:true,force:true});
  fs.unlinkSync(filePath);
  return { output: out };
};
