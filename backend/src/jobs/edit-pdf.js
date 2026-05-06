import fs from "fs";
import {
  PDFDocument,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";

function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Failed to remove temp file: ${filePath}`, err);
  }
}

function parseHexColor(value) {
  if (typeof value !== "string") {
    return rgb(0, 0, 0);
  }

  const hex = value.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return rgb(0, 0, 0);
  }

  const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255;

  return rgb(r, g, b);
}

function resolveStandardFont(fontFamilyRaw, fontFamily, fontWeight, fontStyle) {
  const family = `${fontFamilyRaw || ""} ${fontFamily || ""}`.toLowerCase();
  const isBold = ["bold", "500", "600", "700", "800", "900"].includes(
    String(fontWeight || "").toLowerCase()
  );
  const isItalic = String(fontStyle || "").toLowerCase() === "italic";

  if (
    family.includes("times") ||
    family.includes("cambria") ||
    family.includes("garamond") ||
    family.includes("baskerville") ||
    family.includes("palatino") ||
    family.includes("book antiqua") ||
    family.includes("georgia") ||
    family.includes("serif")
  ) {
    if (isBold && isItalic) return StandardFonts.TimesRomanBoldItalic;
    if (isBold) return StandardFonts.TimesRomanBold;
    if (isItalic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  if (
    family.includes("courier") ||
    family.includes("mono") ||
    family.includes("console") ||
    family.includes("consolas") ||
    family.includes("menlo") ||
    family.includes("monaco") ||
    family.includes("code")
  ) {
    if (isBold && isItalic) return StandardFonts.CourierBoldOblique;
    if (isBold) return StandardFonts.CourierBold;
    if (isItalic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  if (isBold && isItalic) return StandardFonts.HelveticaBoldOblique;
  if (isBold) return StandardFonts.HelveticaBold;
  if (isItalic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

function normalizeTextForStandardFont(text, font) {
  const normalized = String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "*");

  let safe = "";

  for (const char of normalized) {
    if (char === "\n" || char === "\r" || char === "\t") {
      safe += char;
      continue;
    }

    try {
      font.encodeText(char);
      safe += char;
    } catch {
      safe += "?";
    }
  }

  return safe;
}

function normalizeUrl(value) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function addLinkAnnotation(pdfDoc, page, url, rect) {
  const href = normalizeUrl(url);
  if (!href) return;

  const annotation = pdfDoc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(href),
    },
  });
  const annotationRef = pdfDoc.context.register(annotation);

  page.node.addAnnot(annotationRef);
}

function parseEdits(edits) {
  const parsed = typeof edits === "string" ? JSON.parse(edits) : edits ?? [];

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid edits payload");
  }

  return parsed;
}

export default async function editPdfJob({ filePath, buffer, edits = [] } = {}) {
  if (!filePath && !buffer) {
    throw new Error("No PDF input provided");
  }

  try {
    const inputBytes = buffer ?? fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(inputBytes);
    const parsedEdits = parseEdits(edits);
    const embeddedFonts = new Map();

    for (const edit of parsedEdits) {
      if (!edit || typeof edit !== "object") continue;

      const pageIndex = Number(edit.page) - 1;
      if (!Number.isInteger(pageIndex) || pageIndex < 0) continue;
      if (pageIndex >= pdfDoc.getPageCount()) continue;

      const scale = Number(edit.scale) > 0 ? Number(edit.scale) : 1;
      const x = Number(edit.x);
      const y = Number(edit.y);
      const width = Number(edit.width);
      const height = Number(edit.height);
      const fontSize = Number(edit.fontSize);
      const lineHeight = Number(edit.lineHeight);

      if (![x, y, width, height, fontSize].every(Number.isFinite)) {
        continue;
      }

      const page = pdfDoc.getPage(pageIndex);
      const pageHeight = page.getHeight();
      const pdfX = x / scale;
      const pdfWidth = Math.max(width / scale, 1);
      const pdfHeight = Math.max(
        height / scale,
        (Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.3) / scale
      );
      const rectY = pageHeight - (y + height) / scale;

      // Draw a white patch over the original text before writing the new value.
      page.drawRectangle({
        x: Math.max(pdfX - 1, 0),
        y: Math.max(rectY - 1, 0),
        width: pdfWidth + 2,
        height: pdfHeight + 2,
        color: rgb(1, 1, 1),
      });

      const rawText = typeof edit.text === "string" ? edit.text : "";
      const hasText = Boolean(rawText);
      if (!hasText && !edit.link) {
        continue;
      }

      const fontKey = resolveStandardFont(
        edit.fontFamilyRaw,
        edit.fontFamily,
        edit.fontWeight,
        edit.fontStyle
      );

      if (!embeddedFonts.has(fontKey)) {
        embeddedFonts.set(fontKey, await pdfDoc.embedFont(fontKey));
      }

      const font = embeddedFonts.get(fontKey);
      const pdfFontSize = fontSize / scale;
      const pdfLineHeight =
        (Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.3) / scale;
      const textColor = parseHexColor(edit.color);
      const text = normalizeTextForStandardFont(rawText, font);
      const textLines = text.split(/\r?\n/);
      const longestLineWidth = textLines.reduce(
        (maxWidth, line) =>
          Math.max(maxWidth, font.widthOfTextAtSize(line || " ", pdfFontSize)),
        0
      );
      let drawX = pdfX;

      if (edit.textAlign === "center") {
        drawX += Math.max((pdfWidth - longestLineWidth) / 2, 0);
      } else if (edit.textAlign === "right") {
        drawX += Math.max(pdfWidth - longestLineWidth, 0);
      }

      if (text) {
        page.drawText(text, {
          x: drawX,
          y: pageHeight - y / scale - pdfFontSize,
          size: pdfFontSize,
          lineHeight: pdfLineHeight,
          maxWidth: pdfWidth,
          font,
          color: textColor,
        });
      }

      if (edit.underline) {
        textLines.forEach((line, index) => {
          const lineWidth = font.widthOfTextAtSize(line || " ", pdfFontSize);
          let lineX = pdfX;

          if (edit.textAlign === "center") {
            lineX += Math.max((pdfWidth - lineWidth) / 2, 0);
          } else if (edit.textAlign === "right") {
            lineX += Math.max(pdfWidth - lineWidth, 0);
          }

          const lineY =
            pageHeight -
            y / scale -
            pdfFontSize -
            index * pdfLineHeight -
            pdfFontSize * 0.12;

          page.drawLine({
            start: { x: lineX, y: lineY },
            end: { x: lineX + lineWidth, y: lineY },
            thickness: Math.max(pdfFontSize * 0.045, 0.6),
            color: textColor,
          });
        });
      }

      addLinkAnnotation(pdfDoc, page, edit.link, {
        x: pdfX,
        y: rectY,
        width: pdfWidth,
        height: pdfHeight,
      });
    }

    return Buffer.from(await pdfDoc.save());
  } catch (err) {
    throw new Error(`Edit PDF job failed: ${err.message}`);
  } finally {
    safeUnlink(filePath);
  }
}
