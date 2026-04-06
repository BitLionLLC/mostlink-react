import React, {
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SitesContext } from "../contexts/sitesContext";
import styles from "./imageFilePicker.module.css";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Styled file control for images. Calls `onDone` with `{ base64, name, type }` like react-file-base64.
 */
export default function ImageFilePicker({ onDone, ariaLabel, hint }) {
  const id = useId();
  const inputRef = useRef(null);
  const { themeObj } = useContext(SitesContext);
  const accent = themeObj?.accentColor || "#6366f1";
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (file) => {
      if (!file?.type?.startsWith("image/")) {
        return;
      }
      const base64 = await readFileAsDataUrl(file);
      onDone({ base64, name: file.name, type: file.type });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onDone]
  );

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = e.relatedTarget;
    if (next && e.currentTarget.contains(next)) {
      return;
    }
    setDragOver(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div
      className={`${styles.wrap} ${dragOver ? styles.wrapDragging : ""}`}
      style={{ "--picker-accent": accent }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={onChange}
        aria-label={ariaLabel || "Upload image from device"}
      />
      <label htmlFor={id} className={styles.label}>
        <span className={styles.iconWrap} aria-hidden>
          <FontAwesomeIcon icon={["fas", "file-image"]} className={styles.icon} />
        </span>
        <span className={styles.title}>Upload from device</span>
        <span className={styles.hint}>
          {hint || "Drop an image here, or click to browse"}
        </span>
      </label>
    </div>
  );
}
