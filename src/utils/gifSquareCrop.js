import { parseGIF, decompressFrames } from "gifuct-js";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

/** Single-pass output (square or rectangular crop); large GIFs go to Convex storage instead of inline base64. */
const DEFAULT_MAX_SIDE = 512;
const DEFAULT_MAX_COLORS = 256;

async function bufferFromImageSrc(src) {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Could not load GIF (${res.status})`);
  }
  return res.arrayBuffer();
}

function drawPatchToCanvas(frame, tempCanvas, tempCtx, gifCtx) {
  const dims = frame.dims;
  tempCanvas.width = dims.width;
  tempCanvas.height = dims.height;
  const frameImageData = tempCtx.createImageData(dims.width, dims.height);
  frameImageData.data.set(frame.patch);
  tempCtx.putImageData(frameImageData, 0, 0);
  gifCtx.drawImage(tempCanvas, dims.left, dims.top);
}

/**
 * @param {{ maxSide: number, maxColors: number, frameStep: number }} opts
 * @returns {Blob}
 */
function encodeGifCroppedToBlob(parsed, frames, croppedAreaPixels, opts) {
  const { maxSide, maxColors, frameStep } = opts;
  const { width: fullW, height: fullH } = parsed.lsd;
  const { x: cx, y: cy, width: cw, height: ch } = croppedAreaPixels;

  const maxDim = Math.max(cw, ch);
  const scale = maxDim > maxSide ? maxSide / maxDim : 1;
  const outW = Math.max(1, Math.round(cw * scale));
  const outH = Math.max(1, Math.round(ch * scale));

  const gifCanvas = document.createElement("canvas");
  gifCanvas.width = fullW;
  gifCanvas.height = fullH;
  const gifCtx = gifCanvas.getContext("2d");
  if (!gifCtx) {
    throw new Error("Could not get canvas context");
  }

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = outW;
  cropCanvas.height = outH;
  const cropCtx = cropCanvas.getContext("2d");
  if (!cropCtx) {
    throw new Error("Could not get crop canvas context");
  }

  const enc = GIFEncoder();
  let delayAccum = 0;
  let encodedAny = false;

  for (let i = 0; i < frames.length; i++) {
    if (i > 0) {
      const prevD = frames[i - 1].disposalType ?? 1;
      if (prevD === 2) {
        gifCtx.clearRect(0, 0, fullW, fullH);
      }
    }

    drawPatchToCanvas(frames[i], tempCanvas, tempCtx, gifCtx);

    delayAccum += frames[i].delay || 80;

    const shouldEncode =
      (i + 1) % frameStep === 0 || i === frames.length - 1;

    if (!shouldEncode) {
      continue;
    }

    cropCtx.clearRect(0, 0, outW, outH);
    cropCtx.drawImage(gifCanvas, cx, cy, cw, ch, 0, 0, outW, outH);

    const imageData = cropCtx.getImageData(0, 0, outW, outH);
    const palette = quantize(imageData.data, maxColors);
    const index = applyPalette(imageData.data, palette);
    const delay = Math.max(20, delayAccum);
    delayAccum = 0;

    const frameOpts = { palette, delay };
    if (!encodedAny) {
      frameOpts.repeat = 0;
      encodedAny = true;
    }
    enc.writeFrame(index, outW, outH, frameOpts);
  }

  enc.finish();
  const bytes = enc.bytes();
  return new Blob([bytes], { type: "image/gif" });
}

/**
 * Crops each composited frame to the selected rectangle and returns an animated GIF blob (Convex upload).
 */
export async function cropAnimatedGifToBlob(imageSrc, croppedAreaPixels) {
  const buffer = await bufferFromImageSrc(imageSrc);
  const parsed = parseGIF(buffer);
  const frames = decompressFrames(parsed, true);
  if (!frames.length) {
    throw new Error("No frames in GIF");
  }
  return encodeGifCroppedToBlob(parsed, frames, croppedAreaPixels, {
    maxSide: DEFAULT_MAX_SIDE,
    maxColors: DEFAULT_MAX_COLORS,
    frameStep: 1,
  });
}

export function isAnimatedGifSource(src) {
  if (typeof src !== "string") {
    return false;
  }
  if (src.startsWith("data:image/gif")) {
    return true;
  }
  if (/\.gif(\?|$)/i.test(src)) {
    return true;
  }
  if (src.includes("giphy.com/media")) {
    return true;
  }
  return false;
}
