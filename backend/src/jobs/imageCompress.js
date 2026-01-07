import fs from "fs";
import sharp from "sharp";
import archiver from "archiver";

export default async ({ files, options }) => {
  const zipPath = `outputs/compress-${Date.now()}.zip`;
  const zip = archiver("zip");
  zip.pipe(fs.createWriteStream(zipPath));

  for (const f of files) {
    const buf = await sharp(f).resize({ width:2000, withoutEnlargement:true }).webp({ quality:75 }).toBuffer();
    zip.append(buf,{name:`${Date.now()}.webp`});
    fs.unlinkSync(f);
  }

  await zip.finalize();
  return { output: zipPath };
};
