import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import styles from "./squareImageCropModal.module.css";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    if (!url.startsWith("data:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });
}

async function getCroppedImgDataUrl(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
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

const SquareImageCropModal = ({
  imageSrc,
  onCancel,
  onApply,
  accentColor,
  theme,
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
      const dataUrl = await getCroppedImgDataUrl(imageSrc, croppedAreaPixels);
      onApply(dataUrl);
    } catch (err) {
      console.error(err);
      toast(
        "Could not crop that image (try another file or check your connection).",
        { type: "error", theme }
      );
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
        <h2 className={styles.title}>Crop to square</h2>
        <p className={styles.hint}>
          Drag to reposition. Use the slider to zoom. The square is what gets
          saved.
        </p>
        <div className={styles.cropWrap}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
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
            {applying ? "Applying…" : "Use cropped image"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SquareImageCropModal;
