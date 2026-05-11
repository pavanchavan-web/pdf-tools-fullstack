import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Italic,
  Link2,
  Palette,
  Redo2,
  Trash2,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PREVIEW_SCALE = 1.4;
const THUMBNAIL_SCALE = 0.25;
const DEFAULT_COLOR = "#111111";
const FALLBACK_FONTS = [
  "Helvetica",
  "Arial",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Open Sans",
  "Inter",
  "Lato",
  "Nunito",
  "Oswald",
  "Raleway",
  "Ubuntu",
  "Merriweather",
  "Playfair Display",
];
const GOOGLE_FONT_NAMES = new Set(
  FALLBACK_FONTS.filter((fontName) => !["Helvetica", "Arial"].includes(fontName))
);
const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "emoji",
  "math",
  "fangsong",
]);
const FONT_SIZE_PRESETS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40];
const ZOOM_LEVELS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const SELECTION_HANDLES = [
  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
];
let textMeasureContext = null;

function loadGoogleFont(fontName) {
  if (!fontName) return;

  const normalized =
    normalizeFontFamily(fontName);

  const id = `gf-${normalized.replace(
    /\s+/g,
    "-"
  )}`;

  if (document.getElementById(id)) {
    return;
  }

  const weights =
    "300;400;500;600;700;800";

  const link =
    document.createElement("link");

  link.id = id;

  link.rel = "stylesheet";

  link.href =
    `https://fonts.googleapis.com/css2?family=${normalized.replace(
      /\s+/g,
      "+"
    )}:wght@${weights}&display=swap`;

  document.head.appendChild(link);
}

function normalizeFontFamily(fontName) {
  if (!fontName) return "Helvetica";

  return fontName
    .replace(/^['"]|['"]$/g, "")
    .split(",")[0]
    .split("+")
    .pop()
    .trim() || "Helvetica";
}

function formatFontFamily(fontName) {
  if (!fontName) return null;

  const trimmed = fontName.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) return trimmed;
  if (GENERIC_FONT_FAMILIES.has(trimmed.toLowerCase())) return trimmed;
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed;

  return `"${trimmed.replace(/"/g, '\\"')}"`;
}

function buildRenderFontFamily(rawFontFamily, normalizedFontFamily) {
  const families = [];
  const seen = new Set();

  const pushFamily = (fontName) => {
    if (!fontName) return;
    const trimmed = fontName.trim();
    if (!trimmed) return;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    families.push(trimmed);
  };

  String(rawFontFamily || "")
    .split(",")
    .forEach(pushFamily);

  pushFamily(normalizedFontFamily);

  if (!families.some((fontName) => GENERIC_FONT_FAMILIES.has(fontName.toLowerCase()))) {
    pushFamily("sans-serif");
  }

  return families
    .map(formatFontFamily)
    .filter(Boolean)
    .join(", ");
}

function inferFontWeight(fontName, rawFontFamily) {
  const source = `${fontName || ""} ${rawFontFamily || ""}`.toLowerCase();

  if (/black|heavy|extrabold|ultrabold|bold|semibold|demibold/.test(source)) {
    return "bold";
  }

  if (/medium/.test(source)) {
    return "500";
  }

  if (/light/.test(source)) {
    return "300";
  }

  return "normal";
}

function componentToHex(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function getTextMeasureContext() {
  if (textMeasureContext || typeof document === "undefined") {
    return textMeasureContext;
  }

  const canvas = document.createElement("canvas");
  textMeasureContext = canvas.getContext("2d");
  return textMeasureContext;
}

function measureTextWidth(text, layout) {
  const context = getTextMeasureContext();
  if (!context) {
    return Math.max(text.length, 1) * layout.fontSize * 0.55;
  }

  context.font = [
    layout.fontStyle,
    layout.fontWeight,
    `${layout.fontSize}px`,
    layout.renderFontFamily,
  ]
    .filter(Boolean)
    .join(" ");

  return context.measureText(text).width;
}

function sampleBackgroundColor(pixels, canvasWidth, canvasHeight, x, y, width, height) {
  const samplePoints = [];
  const startX = Math.max(0, x - 1);
  const endX = Math.min(canvasWidth - 1, x + width);
  const startY = Math.max(0, y - 1);
  const endY = Math.min(canvasHeight - 1, y + height);

  for (let px = startX; px <= endX; px += 1) {
    samplePoints.push([px, startY]);
    samplePoints.push([px, endY]);
  }

  for (let py = startY; py <= endY; py += 1) {
    samplePoints.push([startX, py]);
    samplePoints.push([endX, py]);
  }

  let total = 0;
  let red = 0;
  let green = 0;
  let blue = 0;

  samplePoints.forEach(([px, py]) => {
    const index = (py * canvasWidth + px) * 4;
    const alpha = pixels[index + 3];
    if (alpha < 16) return;

    red += pixels[index];
    green += pixels[index + 1];
    blue += pixels[index + 2];
    total += 1;
  });

  if (!total) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: red / total,
    g: green / total,
    b: blue / total,
  };
}

function sampleTextColor(pixels, canvasWidth, canvasHeight, block) {
  const x = Math.max(0, Math.floor(block.left));
  const y = Math.max(0, Math.floor(block.top));
  const width = Math.max(
    1,
    Math.min(canvasWidth - x, Math.ceil(block.width))
  );
  const height = Math.max(
    1,
    Math.min(canvasHeight - y, Math.ceil(block.height))
  );

  if (width <= 0 || height <= 0) {
    return DEFAULT_COLOR;
  }

  const background = sampleBackgroundColor(
    pixels,
    canvasWidth,
    canvasHeight,
    x,
    y,
    width,
    height
  );

  let totalWeight = 0;
  let red = 0;
  let green = 0;
  let blue = 0;

  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      const index = (py * canvasWidth + px) * 4;
      const alpha = pixels[index + 3];
      if (alpha < 24) continue;

      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const brightness = (r + g + b) / 3;
      const saturation = max - min;
      const distanceFromBackground =
        Math.abs(r - background.r) +
        Math.abs(g - background.g) +
        Math.abs(b - background.b);

      if (distanceFromBackground < 28 && brightness > 235) {
        continue;
      }

      const weight = Math.max(
        distanceFromBackground,
        saturation * 2,
        255 - brightness
      );

      if (weight < 28) continue;

      red += r * weight;
      green += g * weight;
      blue += b * weight;
      totalWeight += weight;
    }
  }

  if (!totalWeight) {
    return DEFAULT_COLOR;
  }

  return rgbToHex(red / totalWeight, green / totalWeight, blue / totalWeight);
}

function createWordBlocks(item, layout, blockIdPrefix) {
  const text = String(item.str || "");
  const segments = text.match(/(\S+|\s+)/g);
  if (!segments?.length) {
    return [];
  }

  const measuredWidths = segments.map((segment) =>
    measureTextWidth(segment, layout)
  );
  const totalMeasuredWidth = measuredWidths.reduce(
    (sum, segmentWidth) => sum + segmentWidth,
    0
  );
  const scaleFactor =
    totalMeasuredWidth > 0 ? layout.width / totalMeasuredWidth : 1;

  let measuredCursor = 0;

  return segments.flatMap((segment, segmentIndex) => {
    const segmentWidth = measuredWidths[segmentIndex] * scaleFactor;
    const segmentLeft = layout.left + measuredCursor * scaleFactor;
    measuredCursor += measuredWidths[segmentIndex];

    if (!/\S/.test(segment)) {
      return [];
    }

    return [
      {
        id: `${blockIdPrefix}-word-${segmentIndex}`,
        originalText: segment,
        text: segment,
        left: segmentLeft,
        top: layout.top,
        width: Math.max(segmentWidth, layout.fontSize * 0.4),
        height: layout.height,
        fontSize: layout.fontSize,
        lineHeight: layout.fontSize * 1.3,
        fontFamilyRaw: layout.fontFamilyRaw,
        fontFamily: layout.fontFamily,
        renderFontFamily: layout.renderFontFamily,
        fontWeight: layout.fontWeight,
        fontStyle: layout.fontStyle,
        kind: "word",
        underline: false,
        textAlign: "left",
        color: DEFAULT_COLOR,
        scale: layout.scale,
      },
    ];
  });
}

function joinInlineText(previousText, nextText, gap, fontSize) {
  if (!previousText) return nextText;
  if (!nextText) return previousText;

  if (/^[,.;:!?)]/.test(nextText)) {
    return `${previousText}${nextText}`;
  }

  if (previousText.endsWith("(") || previousText.endsWith("/")) {
    return `${previousText}${nextText}`;
  }

  return gap > fontSize * 0.25
    ? `${previousText} ${nextText}`
    : `${previousText}${nextText}`;
}

function shouldContinueParagraph(currentBlock, layout) {
  if (!currentBlock) {
    return false;
  }

  if (
    currentBlock.fontFamilyRaw !== layout.fontFamilyRaw ||
    currentBlock.fontWeight !== layout.fontWeight ||
    currentBlock.fontStyle !== layout.fontStyle
  ) {
    return false;
  }

  const verticalShift = Math.abs(layout.top - currentBlock.lastTop);
  if (verticalShift > layout.fontSize * 2.4) {
    return false;
  }

  if (verticalShift > layout.fontSize * 0.7) {
    return Math.abs(layout.left - currentBlock.lineStartLeft) < layout.fontSize * 4;
  }

  return layout.left - currentBlock.right < layout.fontSize * 6;
}

function buildTextBlocks(textContent, viewport, scale, pageNumber) {
  const blocks = [];
  const styles = textContent.styles || {};
  let currentBlock = null;

  textContent.items.forEach((item, index) => {
    if (!item.str || !item.str.trim()) {
      currentBlock = null;
      return;
    }

    const [, , , , x, y] = item.transform;
    const left = x * scale;
    const fontSize = Math.max(item.height * scale, 8);
    const width = Math.max((item.width || item.str.length * item.height) * scale, 12);
    const top = viewport.height - y * scale - fontSize;
    const height = Math.max(fontSize * 1.35, item.height * scale * 1.35);
    const fontMeta = styles[item.fontName] || {};
    const fontFamilyRaw = String(
      fontMeta.fontFamily || item.fontName || "sans-serif"
    ).trim();
    const fontFamily = normalizeFontFamily(fontFamilyRaw);
    const renderFontFamily = buildRenderFontFamily(fontFamilyRaw, fontFamily);
    const fontWeight = inferFontWeight(item.fontName, fontFamilyRaw);
    const fontStyle = /italic|oblique/i.test(
      `${item.fontName || ""} ${fontFamilyRaw}`
    )
      ? "italic"
      : "normal";

    const layout = {
      left,
      top,
      width,
      height,
      fontSize,
      fontFamilyRaw,
      fontFamily,
      renderFontFamily,
      fontWeight,
      fontStyle,
      scale,
    };

    const blockIdPrefix = `${pageNumber}-${index}`;
    const itemWords = createWordBlocks(item, layout, blockIdPrefix);

    if (!itemWords.length) {
      return;
    }

    if (shouldContinueParagraph(currentBlock, layout)) {
      const isNewLine = Math.abs(layout.top - currentBlock.lastTop) > layout.fontSize * 0.7;
      const gap = left - currentBlock.right;

      currentBlock.text = isNewLine
        ? `${currentBlock.text}\n${item.str.trim()}`
        : joinInlineText(currentBlock.text, item.str.trim(), gap, layout.fontSize);
      currentBlock.originalText = currentBlock.text;
      currentBlock.right = Math.max(currentBlock.right, left + width);
      currentBlock.width = currentBlock.right - currentBlock.left;
      currentBlock.height = Math.max(
        currentBlock.height,
        layout.top + layout.height - currentBlock.top
      );
      currentBlock.lastTop = layout.top;

      if (isNewLine) {
        currentBlock.lineStartLeft = layout.left;
      }

      currentBlock.words.push(
        ...itemWords.map((word) => ({
          ...word,
          page: pageNumber,
          parentId: currentBlock.id,
        }))
      );

      return;
    }

    currentBlock = {
      id: `${pageNumber}-paragraph-${index}`,
      kind: "paragraph",
      page: pageNumber,
      originalText: item.str.trim(),
      text: item.str.trim(),
      left,
      top,
      width,
      height,
      right: left + width,
      lastTop: layout.top,
      lineStartLeft: layout.left,
      fontSize,
      lineHeight: fontSize * 1.3,
      fontFamilyRaw,
      fontFamily,
      renderFontFamily,
      fontWeight,
      fontStyle,
      underline: false,
      textAlign: "left",
      color: DEFAULT_COLOR,
      scale,
      words: itemWords.map((word) => ({
        ...word,
        page: pageNumber,
        parentId: `${pageNumber}-paragraph-${index}`,
      })),
    };

    blocks.push(currentBlock);

  });

  return blocks.map(({ right, lastTop, lineStartLeft, ...block }) => block);
}

function getRenderedBlock(block) {
  const text = typeof block.text === "string" ? block.text : "";
  const lines = text.split(/\r?\n/);
  const longestLine = lines.reduce(
    (max, line) => Math.max(max, line.length),
    0
  );
  const width = Math.max(block.width, longestLine * block.fontSize * 0.58 + 10);
  const lineHeight = block.lineHeight || block.fontSize * 1.3;
  const height = Math.max(block.height, lines.length * lineHeight + 6);

  return {
    ...block,
    text,
    lineHeight,
    renderWidth: width,
    renderHeight: height,
  };
}

function clampRenderedBlock(block, page) {
  const rendered = getRenderedBlock(block);
  if (!page) return rendered;

  const left = Math.max(0, Math.min(rendered.left, page.width - 1));
  const top = Math.max(0, Math.min(rendered.top, page.height - 1));
  const maxWidth = Math.max(page.width - left, 1);
  const maxHeight = Math.max(page.height - top, 1);

  return {
    ...rendered,
    left,
    top,
    renderWidth: Math.min(rendered.renderWidth, maxWidth),
    renderHeight: Math.min(rendered.renderHeight, maxHeight),
  };
}

function hasBlockChanged(original, current) {
  return (
    original.text !== current.text ||
    original.fontSize !== current.fontSize ||
    original.fontFamilyRaw !== current.fontFamilyRaw ||
    original.fontFamily !== current.fontFamily ||
    original.fontWeight !== current.fontWeight ||
    original.fontStyle !== current.fontStyle ||
    original.underline !== current.underline ||
    original.textAlign !== current.textAlign ||
    original.color !== current.color ||
    original.link !== current.link
  );
}

function findWordAtPoint(block, absoluteX, absoluteY) {
  if (!block?.words?.length) {
    return null;
  }

  return (
    block.words.find(
      (word) =>
        absoluteX >= word.left &&
        absoluteX <= word.left + word.width &&
        absoluteY >= word.top &&
        absoluteY <= word.top + word.height
    ) || null
  );
}

export default function PdfEditor({ file, onChangeFile }) {
  const pageRefs = useRef([]);
  const activeEditorRef = useRef(null);
  const colorInputRef = useRef(null);
  const editsRef = useRef({});

  const [pages, setPages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editsById, setEditsById] = useState({});
  const [history, setHistory] = useState({ past: [], future: [] });
  const [pdfFonts, setPdfFonts] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const historyRef = useRef(history);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    activeEditorRef.current?.focus();
  }, [selectedId]);

  function getScaledPointerPosition(event, target) {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
      x: x / zoom,
      y: y / zoom,
    };
  }

  useEffect(() => {
    editsRef.current = editsById;
  }, [editsById]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (!(event.ctrlKey || event.metaKey)) return;
      if (key !== "z" && key !== "y") return;

      event.preventDefault();

      if (key === "y" || (key === "z" && event.shiftKey)) {
        redo();
        return;
      }

      undo();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history]);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setError("");
      setPages([]);
      setSelectedId(null);
      setEditsById({});
      setHistory({ past: [], future: [] });

      try {
        const buffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        const nextPages = [];
        const detectedFonts = new Map();

        for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await doc.getPage(pageNumber);
          const viewport = page.getViewport({ scale: PREVIEW_SCALE });

          const previewCanvas = document.createElement("canvas");
          previewCanvas.width = viewport.width;
          previewCanvas.height = viewport.height;
          const previewContext = previewCanvas.getContext("2d", {
            willReadFrequently: true,
          });

          await page.render({
            canvasContext: previewContext,
            viewport,
          }).promise;

          const thumbViewport = page.getViewport({ scale: THUMBNAIL_SCALE });
          const thumbCanvas = document.createElement("canvas");
          thumbCanvas.width = thumbViewport.width;
          thumbCanvas.height = thumbViewport.height;

          await page.render({
            canvasContext: thumbCanvas.getContext("2d"),
            viewport: thumbViewport,
          }).promise;

          const textContent = await page.getTextContent();
          const blocks = buildTextBlocks(
            textContent,
            viewport,
            PREVIEW_SCALE,
            pageNumber
          );

          const previewPixels = previewContext.getImageData(
            0,
            0,
            previewCanvas.width,
            previewCanvas.height
          ).data;
          const styledBlocks = blocks.map((block) => {
            const color = sampleTextColor(
              previewPixels,
              previewCanvas.width,
              previewCanvas.height,
              block
            );

            return {
              ...block,
              color,
              words: block.words.map((word) => ({
                ...word,
                color,
              })),
            };
          });

          styledBlocks.forEach((block) => {
            loadGoogleFont(block.fontFamily);
            detectedFonts.set(block.fontFamilyRaw, {
              value: block.fontFamilyRaw,
              label: block.fontFamily,
              renderFontFamily: block.renderFontFamily,
            });
          });

          nextPages.push({
            number: pageNumber,
            width: viewport.width,
            height: viewport.height,
            previewSrc: previewCanvas.toDataURL("image/png"),
            thumbSrc: thumbCanvas.toDataURL("image/png"),
            blocks: styledBlocks,
          });
        }

        if (!cancelled) {
          setPages(nextPages);
          setPdfFonts(Array.from(detectedFonts.values()));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load PDF");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [file]);

  function getBlockById(blockId) {
    for (const page of pages) {
      const block = page.blocks.find((item) => item.id === blockId);
      if (block) return block;

      for (const paragraph of page.blocks) {
        const word = paragraph.words.find((item) => item.id === blockId);
        if (word) return word;
      }
    }

    return null;
  }

  function getPageForBlock(block) {
    if (!block) return null;
    return pages.find((page) => page.number === block.page) || null;
  }

  function getCurrentBlock(block) {
    return clampRenderedBlock({
      ...block,
      ...(editsById[block.id] || {}),
    }, getPageForBlock(block));
  }

  const selectedBlock = selectedId ? getBlockById(selectedId) : null;
  const selectedBlockState = selectedBlock ? getCurrentBlock(selectedBlock) : null;
  const fontSizeOptions = Array.from(
    new Set(
      [
        ...(selectedBlockState
          ? [Number(selectedBlockState.fontSize.toFixed(3))]
          : []),
        ...FONT_SIZE_PRESETS,
      ].map((value) => Number(value))
    )
  ).sort((left, right) => left - right);
  const availableFonts = [
    ...pdfFonts,
    ...FALLBACK_FONTS.map((fontName) => ({
      value: fontName,
      label: fontName,
      renderFontFamily: buildRenderFontFamily(fontName, fontName),
    })),
  ].filter(
    (fontOption, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.value.toLowerCase() === fontOption.value.toLowerCase()
      ) === index
  );
  const currentColor = selectedBlockState?.color ?? DEFAULT_COLOR;

  function commitEdits(updater) {
    setEditsById((previous) => {
      const next = updater(previous);
      if (next === previous) return previous;

      setHistory((currentHistory) => ({
        past: [...currentHistory.past, previous].slice(-80),
        future: [],
      }));

      return next;
    });
  }

  function undo() {
    const previous = history.past[history.past.length - 1];
    if (!previous) return;

    const current = editsRef.current;
    setEditsById(previous);
    setSelectedId(null);
    setHistory({
      past: history.past.slice(0, -1),
      future: [current, ...history.future].slice(0, 80),
    });
  }

  function redo() {
    const next = history.future[0];
    if (!next) return;

    const current = editsRef.current;
    setEditsById(next);
    setSelectedId(null);
    setHistory({
      past: [...history.past, current].slice(-80),
      future: history.future.slice(1),
    });
  }

  function setZoomByStep(direction) {
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= zoom);
    const baseIndex = currentIndex === -1 ? ZOOM_LEVELS.length - 1 : currentIndex;
    const nextIndex =
      direction > 0
        ? Math.min(baseIndex + (ZOOM_LEVELS[baseIndex] === zoom ? 1 : 0), ZOOM_LEVELS.length - 1)
        : Math.max(baseIndex - 1, 0);

    setZoom(ZOOM_LEVELS[nextIndex]);
  }

  function promptForLink() {
    if (!selectedBlockState) return;

    const value = window.prompt(
      "Enter link URL",
      selectedBlockState.link || "https://"
    );

    if (value === null) return;

    const trimmed = value.trim();
    updateSelectedBlock({ link: trimmed || "" });
  }

  function updateSelectedBlock(patch) {
    if (!selectedId) return;

    const originalBlock = getBlockById(selectedId);
    if (!originalBlock) return;

    if (patch.fontFamilyRaw || patch.fontFamily) {
      loadGoogleFont(patch.fontFamily || patch.fontFamilyRaw);
    }

    commitEdits((previous) => {
      const currentPatch = previous[selectedId] || {};
      const normalizedPatch = { ...patch };
      const next = { ...previous };

      if (originalBlock.kind === "paragraph") {
        originalBlock.words.forEach((word) => {
          delete next[word.id];
        });
      }

      if (originalBlock.kind === "word" && originalBlock.parentId) {
        delete next[originalBlock.parentId];
      }

      if (normalizedPatch.fontFamilyRaw && !normalizedPatch.fontFamily) {
        normalizedPatch.fontFamily = normalizeFontFamily(normalizedPatch.fontFamilyRaw);
      }

      if (normalizedPatch.fontFamily || normalizedPatch.fontFamilyRaw) {
        normalizedPatch.renderFontFamily = buildRenderFontFamily(
          normalizedPatch.fontFamilyRaw ||
          currentPatch.fontFamilyRaw ||
          originalBlock.fontFamilyRaw,
          normalizedPatch.fontFamily ||
          currentPatch.fontFamily ||
          originalBlock.fontFamily
        );
      }

      const nextBlock = clampRenderedBlock({
        ...originalBlock,
        ...currentPatch,
        ...normalizedPatch,
      }, getPageForBlock(originalBlock));

      if (!hasBlockChanged(originalBlock, nextBlock)) {
        delete next[selectedId];
        return previous[selectedId] ? next : previous;
      }

      return {
        ...next,
        [selectedId]: {
          ...currentPatch,
          ...normalizedPatch,
        },
      };
    });
  }

  function setSelectedFontSize(nextSize) {
    const parsedSize = Number(nextSize);
    if (!Number.isFinite(parsedSize)) return;

    updateSelectedBlock({
      fontSize: Math.max(6, parsedSize),
      lineHeight: Math.max(8, parsedSize * 1.3),
    });
  }

  function removeSelectedText() {
    if (!selectedBlockState) return;

    updateSelectedBlock({ text: "" });
    setSelectedId(null);
  }

  async function copySelectedText() {
    if (!selectedBlockState?.text || !navigator?.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedBlockState.text);
    } catch {
      // Ignore clipboard failures; the editor should stay usable.
    }
  }

  async function download() {
    setIsSaving(true);

    setError("");

    try {
      const edits = [];

      pages.forEach((page) => {
        page.blocks.forEach((block) => {
          if (editsById[block.id]) {
            const current =
              getCurrentBlock(block);

            edits.push({
              id: block.id,

              page: current.page,

              text: current.text,

              x: current.left,

              y: current.top,

              width:
                current.renderWidth,

              height:
                current.renderHeight,

              fontSize:
                current.fontSize,

              lineHeight:
                current.lineHeight,

              fontFamily:
                current.fontFamily,

              fontFamilyRaw:
                current.fontFamilyRaw,

              fontWeight:
                current.fontWeight,

              fontStyle:
                current.fontStyle,

              underline:
                current.underline,

              textAlign:
                current.textAlign,

              color:
                current.color,

              link:
                current.link,

              scale:
                current.scale,
            });
          }

          block.words.forEach((word) => {
            if (!editsById[word.id]) {
              return;
            }

            const currentWord =
              getCurrentBlock(word);

            edits.push({
              id: word.id,

              page:
                currentWord.page,

              text:
                currentWord.text,

              x:
                currentWord.left,

              y:
                currentWord.top,

              width:
                currentWord.renderWidth,

              height:
                currentWord.renderHeight,

              fontSize:
                currentWord.fontSize,

              lineHeight:
                currentWord.lineHeight,

              fontFamily:
                currentWord.fontFamily,

              fontFamilyRaw:
                currentWord.fontFamilyRaw,

              fontWeight:
                currentWord.fontWeight,

              fontStyle:
                currentWord.fontStyle,

              underline:
                currentWord.underline,

              textAlign:
                currentWord.textAlign,

              color:
                currentWord.color,

              link:
                currentWord.link,

              scale:
                currentWord.scale,
            });
          });
        });
      });

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "edits",
        JSON.stringify(edits)
      );

      const response = await fetch(
        "http://localhost:5000/api/edit-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let message =
          "Failed to create edited PDF";

        try {
          const payload =
            await response.json();

          message =
            payload.message ||
            message;
        } catch { }

        throw new Error(message);
      }

      const blob =
        await response.blob();

      if (!blob.size) {
        throw new Error(
          "Generated PDF is empty"
        );
      }

      const objectUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = objectUrl;

      link.download =
        "edited.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          objectUrl
        );
      }, 2000);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Failed to create edited PDF"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#f3f5f8]">
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <div className="font-medium text-red-600 ">Edit PDF</div>
          <div className="text-sm text-slate-900">
            Click any text on the page to edit it in place.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={undo}
              disabled={!history.past.length}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!history.future.length}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setZoomByStep(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="w-14 text-center text-sm font-medium text-slate-700">
              {Math.round(zoom * 100)}%
            </div>
            <button
              type="button"
              onClick={() => setZoomByStep(1)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onChangeFile}
            className="rounded-lg border border-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-800 bg-red-600"
          >
            Change PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[148px] border-r border-slate-200 bg-white/70 p-2 overflow-y-auto">
          {pages.map((page) => (
            <button
              key={page.number}
              type="button"
              className="mb-3 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
              onClick={() =>
                pageRefs.current[page.number - 1]?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              <img
                src={page.thumbSrc}
                alt={`Page ${page.number}`}
                className="w-full block"
              />
              <div className="py-1 text-xs text-gray-600 text-center">
                Page {page.number}
              </div>
            </button>
          ))}
        </aside>

        <main
          className="flex-1 overflow-auto bg-[#eef2f7] p-8"
          onMouseDown={() => setSelectedId(null)}
        >
          {isLoading && (
            <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
              Loading PDF...
            </div>
          )}

          {!isLoading && error && (
            <div className="mx-auto mb-6 max-w-xl rounded-2xl bg-red-50 border border-red-200 text-red-700 p-4">
              {error}
            </div>
          )}

          {!isLoading &&
            pages.map((page) => (
              <div
                key={page.number}
                ref={(element) => {
                  pageRefs.current[page.number - 1] = element;
                }}
                className="relative mx-auto mb-12"
                style={{ width: page.width * zoom, height: page.height * zoom }}
              >
                <div
                  className="relative rounded-sm bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                  style={{
                    width: page.width,
                    height: page.height,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    if (event.target === event.currentTarget) {
                      setSelectedId(null);
                    }
                  }}
                >
                  <img
                    src={page.previewSrc}
                    alt={`Preview of page ${page.number}`}
                    className="block w-full h-full select-none"
                    style={{ pointerEvents: "none" }}
                  />

                  {page.blocks.map((block) => {
                    const currentParagraph = getCurrentBlock(block);
                    const selectedWord = block.words.find((word) => word.id === selectedId);
                    const selectedWordState = selectedWord
                      ? getCurrentBlock(selectedWord)
                      : null;
                    const paragraphIsActive = selectedId === block.id;
                    const activeSelection = selectedWordState || (paragraphIsActive ? currentParagraph : null);
                    const paragraphHasEdit = Boolean(editsById[block.id]);
                    const editedWords = block.words
                      .filter((word) => Boolean(editsById[word.id]) && word.id !== selectedId)
                      .map((word) => getCurrentBlock(word));

                    const buildOverlayStyle = (targetBlock) => ({
                      position: "absolute",
                      left: targetBlock.left,
                      top: targetBlock.top,
                      width: targetBlock.renderWidth,
                      height: targetBlock.renderHeight,
                      fontSize: `${targetBlock.fontSize}px`,
                      lineHeight: `${targetBlock.lineHeight}px`,
                      fontFamily: targetBlock.renderFontFamily,
                      fontWeight: targetBlock.fontWeight,
                      fontStyle: targetBlock.fontStyle,
                      textDecoration: targetBlock.underline ? "underline" : "none",
                      color: targetBlock.color,
                      background: "#ffffff",
                      textAlign: targetBlock.textAlign,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflow: "hidden",
                      padding: "0 2px",
                      margin: 0,
                      display: "block",
                      boxSizing: "border-box",
                      zIndex: 20,
                      borderRadius: "2px",
                    });

                    const selectionBoxStyle = activeSelection
                      ? {
                        position: "absolute",
                        left: Math.max(0, activeSelection.left),
                        top: Math.max(0, activeSelection.top),
                        width: Math.min(
                          activeSelection.renderWidth,
                          page.width - Math.max(0, activeSelection.left)
                        ),
                        height: Math.min(
                          activeSelection.renderHeight,
                          page.height - Math.max(0, activeSelection.top)
                        ),
                        zIndex: 30,
                        pointerEvents: "none",
                      }
                      : null;

                    const selectBlock = (event) => {
                      event.stopPropagation();

                      const { x, y } = getScaledPointerPosition(event, event.currentTarget);
                      const absoluteX = block.left + x;
                      const absoluteY = block.top + y;
                      const targetWord = findWordAtPoint(block, absoluteX, absoluteY);

                      if (targetWord) {
                        setSelectedId(targetWord.id);
                        loadGoogleFont(targetWord.fontFamily);
                        return;
                      }

                      setSelectedId(block.id);
                      loadGoogleFont(currentParagraph.fontFamily);
                    };

                    return (
                      <div key={block.id}>
                        {activeSelection && (
                          <div style={selectionBoxStyle}>
                            <div className="absolute inset-0 rounded-[2px] border border-dashed border-sky-500 bg-white/10" />

                            {SELECTION_HANDLES.map((handleClassName) => (
                              <span
                                key={handleClassName}
                                className={`absolute h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] ${handleClassName}`}
                              />
                            ))}

                            <div
                              className="absolute top-full mt-3 flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-lg pointer-events-auto"
                              style={{
                                left: Math.max(0, Math.min(
                                  activeSelection.renderWidth / 2 - 40,
                                  page.width - activeSelection.left - 88
                                )),
                              }}
                            >
                              <button
                                type="button"
                                onMouseDown={(event) => {
                                  event.stopPropagation();
                                  void copySelectedText();
                                }}
                                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Copy text"
                              >
                                <Copy className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onMouseDown={(event) => {
                                  event.stopPropagation();
                                  removeSelectedText();
                                }}
                                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                                title="Delete text"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          aria-label={`Edit text: ${block.originalText}`}
                          title={block.originalText}
                          className="absolute rounded-sm hover:ring-1 hover:ring-sky-300"
                          style={{
                            left: block.left,
                            top: block.top,
                            width: Math.max(block.width, 16),
                            height: Math.max(block.height, 20),
                            background: "transparent",
                            border: "none",
                            cursor: "text",
                            zIndex: 10,
                          }}
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={selectBlock}
                        />

                        {paragraphHasEdit && !paragraphIsActive && !selectedWordState && (
                          <button
                            type="button"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={selectBlock}
                            style={{
                              ...buildOverlayStyle(currentParagraph),
                              border: "none",
                              appearance: "none",
                              cursor: "text",
                            }}
                          >
                            {currentParagraph.text}
                          </button>
                        )}

                        {editedWords.map((word) => (
                          <button
                            key={word.id}
                            type="button"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(word.id);
                              loadGoogleFont(word.fontFamily);
                            }}
                            style={{
                              ...buildOverlayStyle(word),
                              border: "none",
                              appearance: "none",
                              cursor: "text",
                            }}
                          >
                            {word.text}
                          </button>
                        ))}

                        {activeSelection &&
                          (selectedId === activeSelection.id ? (
                            <textarea
                              ref={(element) => {
                                activeEditorRef.current = element;
                              }}
                              value={activeSelection.text}
                              spellCheck={false}
                              onChange={(event) =>
                                updateSelectedBlock({ text: event.target.value })
                              }
                              onMouseDown={(event) => event.stopPropagation()}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                  setSelectedId(null);
                                }
                              }}
                              style={{
                                ...buildOverlayStyle(activeSelection),
                                border: "none",
                                outline: "none",
                                resize: "none",
                                boxShadow: "none",
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              onMouseDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedId(activeSelection.id);
                                loadGoogleFont(activeSelection.fontFamily);
                              }}
                              style={{
                                ...buildOverlayStyle(activeSelection),
                                border: "none",
                                appearance: "none",
                                cursor: "text",
                              }}
                            >
                              {activeSelection.text}
                            </button>
                          ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </main>

        <aside className="w-[300px] border-l border-slate-200 bg-white px-4 py-5">
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex-1 overflow-y-auto pr-1">
              {!selectedBlockState && (
                <div>
                  <div className="text-[15px] font-medium text-slate-900">
                    Text Styles
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Select a text layer to edit its styles.
                  </div>
                </div>
              )}

              {selectedBlockState && (
                <div className="space-y-4">
                  <div>
                    <div className="text-[15px] font-medium text-slate-900">
                      Text Styles
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Edit only the selected text layer.
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-900">
                      Selected Text
                    </label>
                    <textarea
                      value={selectedBlockState.text}
                      onChange={(event) =>
                        updateSelectedBlock({ text: event.target.value })
                      }
                      className="mt-2 min-h-[112px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_92px] gap-2">
                    <select
                      value={selectedBlockState.fontFamilyRaw}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700"
                      onChange={(event) => {
                        const nextFont = availableFonts.find(
                          (fontOption) => fontOption.value === event.target.value
                        );

                        updateSelectedBlock({
                          fontFamilyRaw: event.target.value,
                          fontFamily:
                            nextFont?.label ||
                            normalizeFontFamily(event.target.value),
                          renderFontFamily:
                            nextFont?.renderFontFamily ||
                            buildRenderFontFamily(
                              event.target.value,
                              normalizeFontFamily(event.target.value)
                            ),
                        });
                      }}
                    >
                      {availableFonts.map((fontOption) => (
                        <option key={fontOption.value} value={fontOption.value}>
                          {fontOption.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={Number(selectedBlockState.fontSize.toFixed(3))}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700"
                      onChange={(event) => setSelectedFontSize(event.target.value)}
                    >
                      {fontSizeOptions.map((fontSize) => (
                        <option key={fontSize} value={fontSize}>
                          {fontSize}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedBlock({
                          fontWeight:
                            selectedBlockState.fontWeight === "bold"
                              ? "normal"
                              : "bold",
                        })
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${selectedBlockState.fontWeight === "bold"
                        ? "border-sky-500 bg-sky-50 text-sky-600"
                        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedBlock({
                          fontStyle:
                            selectedBlockState.fontStyle === "italic"
                              ? "normal"
                              : "italic",
                        })
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${selectedBlockState.fontStyle === "italic"
                        ? "border-sky-500 bg-sky-50 text-sky-600"
                        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedBlock({
                          underline: !selectedBlockState.underline,
                        })
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${selectedBlockState.underline
                        ? "border-sky-500 bg-sky-50 text-sky-600"
                        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      title="Underline"
                    >
                      <Underline className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => colorInputRef.current?.click()}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50"
                      title="Text color"
                    >
                      <Palette className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {[
                      { value: "left", icon: AlignLeft, label: "Align left" },
                      { value: "center", icon: AlignCenter, label: "Align center" },
                      { value: "right", icon: AlignRight, label: "Align right" },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => updateSelectedBlock({ textAlign: item.value })}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${selectedBlockState.textAlign === item.value
                            ? "border-sky-500 bg-sky-50 text-sky-600"
                            : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          title={item.label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={promptForLink}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${selectedBlockState.link
                        ? "border-sky-500 bg-sky-50 text-sky-600"
                        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      title={selectedBlockState.link || "Add link"}
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                  </div>

                  {selectedBlockState.link && (
                    <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                      {selectedBlockState.link}
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-[15px] font-medium text-slate-900">
                      Current Color
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateSelectedBlock({ color: currentColor })}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white"
                        title="Current color"
                      >
                        <span
                          className="h-5 w-5 rounded-full border-2 border-white shadow-[0_0_0_2px_#2563eb]"
                          style={{ backgroundColor: currentColor }}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateSelectedBlock({ color: "#ffffff" })}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white"
                        title="White"
                      >
                        <span className="h-4 w-4 rounded-sm border border-slate-300 bg-white" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[15px] font-medium text-slate-900">
                      Custom Colors
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                        title="Choose custom color"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={removeSelectedText}
                    className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Remove Selected Text
                  </button>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                onClick={download}
                disabled={isLoading || isSaving}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isSaving ? "Preparing PDF..." : "Download Edited PDF"}
              </button>
            </div>

            <input
              ref={colorInputRef}
              type="color"
              value={currentColor}
              onChange={(event) =>
                updateSelectedBlock({ color: event.target.value })
              }
              className="sr-only"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
