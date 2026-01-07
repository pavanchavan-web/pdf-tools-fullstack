import fs from "fs";
import path from "path";
import sharp from "sharp";
import { exec } from "child_process";
import archiver from "archiver";

const MAGICK = "magick";
const SHARP_INPUT = ["jpeg","jpg","png","webp","avif"];
const SHARP_OUTPUT = ["jpeg","png","webp","avif","gif","tiff"];

export default async ({ files, formats }) => {
  const out = `outputs/convert-${Date.now()}.zip`;
  const zip = archiver("zip");
  zip.pipe(fs.createWriteStream(out));

  for (let i = 0; i < files.length; i++) {
    const input = files[i].path;
    const target = formats[i];
    const base = path.parse(files[i].name).name;
    const outName = `${base}.${target}`;

    const meta = await sharp(input).metadata().catch(() => null);

    if (meta && SHARP_INPUT.includes(meta.format) && SHARP_OUTPUT.includes(target)) {
      const buf = await sharp(input).toFormat(target).toBuffer();
      zip.append(buf, { name: outName });
    } else {
      await new Promise((r, j) =>
        exec(`"${MAGICK}" "${input}" "${outName}"`, e => e ? j(e) : r())
      );
      zip.file(outName);
    }

    fs.unlinkSync(input);
  }

  await zip.finalize();
  return { output: out };
};
