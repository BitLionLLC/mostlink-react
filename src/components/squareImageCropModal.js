import React, { useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import { compressRasterDataUrl } from "../utils/imageCompress";
import {
  cropAnimatedGifToBlob,
  isAnimatedGifSource,
} from "../utils/gifSquareCrop";
import styles from "./squareImageCropModal.module.css";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    if (!url.startsWith("data:") && !url.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });
}

async function rasterCropToJpegDataUrl(src, pixelCrop) {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Load remote images via fetch → blob URL so the canvas is not tainted (toDataURL works).
 * Falls back to drawing the URL directly if fetch is blocked (may still fail with a security error).
 */
async function getCroppedImgDataUrl(imageSrc, pixelCrop) {
  const isHttp =
    typeof imageSrc === "string" &&
    (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"));

  if (!isHttp) {
    return rasterCropToJpegDataUrl(imageSrc, pixelCrop);
  }

  let objectUrl = null;
  try {
    const res = await fetch(imageSrc, { mode: "cors", credentials: "omit" });
    if (!res.ok) {
      throw new Error(`Could not fetch image (${res.status})`);
    }
    const blob = await res.blob();
    objectUrl = URL.createObjectURL(blob);
    return await rasterCropToJpegDataUrl(objectUrl, pixelCrop);
  } catch (fetchErr) {
    console.warn("CORS fetch for crop failed, trying direct draw:", fetchErr);
    return rasterCropToJpegDataUrl(imageSrc, pixelCrop);
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

async function uploadGifBlob(blob) {
  const api = process.env.REACT_APP_API_BASE;
  const { data } = await axios.post(
    `${api}/api/sites/image-upload-url`,
    {},
    { withCredentials: true }
  );
  const uploadUrl = data.uploadUrl;
  if (!uploadUrl) {
    throw new Error("No upload URL from server");
  }
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/gif" },
    body: blob,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      text ? `Upload failed (${res.status}): ${text.slice(0, 200)}` : `Upload failed (${res.status})`
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Upload response was not JSON");
  }
  const storageId = parsed.storageId;
  if (!storageId) {
    throw new Error("No storage id from upload");
  }
  return `storage:${storageId}`;
}

const SquareImageCropModal = ({
  imageSrc,
  onCancel,
  onApply,
  accentColor,
  theme,
  /** Width / height of the crop frame (e.g. 1 for square, 16/9 for widescreen). */
  aspect = 1,
  cropTitle,
  cropHint,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) {
      toast("Adjust the crop first.", { type: "warning", theme });
      return;
    }
    setApplying(true);
    try {
      if (isAnimatedGifSource(imageSrc)) {
        try {
          const blob = await cropAnimatedGifToBlob(imageSrc, croppedAreaPixels);
          const ref = await uploadGifBlob(blob);
          onApply(ref);
        } catch (gifErr) {
          console.warn("GIF encode/upload failed, using still image:", gifErr);
          let dataUrl = await getCroppedImgDataUrl(imageSrc, croppedAreaPixels);
          dataUrl = await compressRasterDataUrl(dataUrl);
          onApply(dataUrl);
          toast(
            "Saved as a still image (animated GIF processing failed).",
            { type: "info", theme }
          );
        }
      } else {
        let dataUrl = await getCroppedImgDataUrl(imageSrc, croppedAreaPixels);
        dataUrl = await compressRasterDataUrl(dataUrl);
        onApply(dataUrl);
      }
    } catch (err) {
      console.error(err);
      const serverMsg =
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      const detail =
        serverMsg ||
        err?.message ||
        "Could not crop or upload that image (try another file or check your connection).";
      toast(detail, { type: "error", theme });
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <div
        className={styles.blocker}
        onClick={onCancel}
        role="presentation"
      />
      <div className={styles.modal}>
        <div className={styles.closeButton} onClick={onCancel}>
          +
        </div>
        <h2 className={styles.title}>
          {cropTitle ?? (aspect === 1 ? "Crop to square" : "Crop image")}
        </h2>
        <p className={styles.hint}>
          {cropHint ??
            (isAnimatedGifSource(imageSrc)
              ? "Drag and zoom. Animated GIFs are cropped and uploaded in full quality."
              : aspect === 1
                ? "Drag to reposition. Use the slider to zoom. The square is what gets saved."
                : "Drag to reposition. Use the slider to zoom. The highlighted area is what gets saved.")}
        </p>
        <div className={styles.cropWrap}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className={styles.zoomLabel}>
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className={styles.zoomRange}
          />
        </label>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel} className={styles.btnGhost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className={styles.btnPrimary}
            style={{ backgroundColor: accentColor || "#6b9fff" }}
          >
            {applying
              ? isAnimatedGifSource(imageSrc)
                ? "Uploading GIF…"
                : "Applying…"
              : "Use cropped image"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SquareImageCropModal;
