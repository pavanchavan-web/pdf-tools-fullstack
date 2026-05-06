import { PDFDocument, rgb } from "pdf-lib";

export async function exportPdf(file, objects) {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);

  objects.forEach((obj) => {
    const page = pdfDoc.getPage(obj.page - 1);
    page.drawText(obj.text, {
      x: obj.x / 1.4,
      y: obj.y / 1.4,
      size: obj.fontSize / 1.4,
      color: rgb(0, 0, 0),
    });
  });

  const output = await pdfDoc.save();
  const blob = new Blob([output], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "edited.pdf";
  link.click();
}
