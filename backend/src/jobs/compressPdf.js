import { exec } from "child_process";
import fs from "fs";

export default ({ filePath }) =>
  new Promise((resolve, reject) => {
    const out = `outputs/compress-${Date.now()}.pdf`;
    exec(
      `"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dPDFSETTINGS=/screen -dNOPAUSE -dBATCH -sOutputFile="${out}" "${filePath}"`,
      err => {
        fs.unlinkSync(filePath);
        err ? reject(err) : resolve({ output: out });
      }
    );
  });
