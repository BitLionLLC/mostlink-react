import imageCompression from "browser-image-compression";

/**
 * Shrinks JPEG/PNG/WebP data URLs before save. Skips GIF so animation is preserved when passed through unchanged.
 */
export async function compressRasterDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") {
    return dataUrl;
  }
  if (dataUrl.startsWith("data:image/gif")) {
    return dataUrl;
  }
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (blob.type === "image/gif") {
      return dataUrl;
    }
    const file = new File([blob], "image.jpg", {
      type: blob.type || "image/jpeg",
    });
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressed);
    });
  } catch (e) {
    console.warn("Image compression failed, using original", e);
    return dataUrl;
  }
}
