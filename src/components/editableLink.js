import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { TextField, Select, MenuItem, ListItemText } from "@mui/material";
import { SitesContext } from "../contexts/sitesContext";

import styles from "./editableLink.module.css";

const LIVE_TYPES = {
  NONE: "none",
  TWITCH: "twitch",
  YOUTUBE: "youtube",
};

const EditableLink = ({ link, links, setLinks, deleteLink, moveLink, index, id }) => {
  const { isSubscribed, theme } = useContext(SitesContext);

  const [typeOfLiveNotification, setTypeOfLiveNotification] = useState(
    link.live?.type || LIVE_TYPES.NONE
  );
  const [liveMeta, setLiveMeta] = useState(link.live?.meta || "");

  const transformIconKey = (key, lib) => {
    const arr = key.split("").slice(2);
    let valueArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].toUpperCase() === arr[i] &&
        !Number.isInteger(Number(arr[i])) &&
        i !== 0
      ) {
        valueArr.push("-");
        valueArr.push(arr[i].toLowerCase());
      } else if (
        arr[i].toUpperCase() === arr[i] &&
        !Number.isInteger(Number(arr[i]))
      ) {
        valueArr.push(arr[i].toLowerCase());
      } else {
        valueArr.push(arr[i]);
      }
    }
    const display = arr.join("");
    const value = lib + "_" + valueArr.join("");
    return [display, value];
  };

  const selectOptions = Object.keys(fab)
    .concat(Object.keys(far))
    .filter((key) => key !== "faFontAwesomeLogoFull")
    .sort()
    .map((key) => {
      const lib = Object.keys(far).includes(key) ? "far" : "fab";
      const [label, value] = transformIconKey(key, lib);
      return { value, label };
    });

  return (
    <li className={styles.linkCard}>
      <div className={styles.cardTopBar}>
        <div className={styles.reorderGroup}>
          <button
            type="button"
            className={styles.reorderBtn}
            disabled={index === 0}
            onClick={() => moveLink(index, index - 1)}
            aria-label="Move link up"
          >
            <FontAwesomeIcon icon={["fas", "arrow-up"]} size="xs" />
          </button>
          <button
            type="button"
            className={styles.reorderBtn}
            disabled={index === links.length - 1}
            onClick={() => moveLink(index, index + 1)}
            aria-label="Move link down"
          >
            <FontAwesomeIcon icon={["fas", "arrow-down"]} size="xs" />
          </button>
        </div>

        <span className={styles.linkIndex}>Link {index + 1}</span>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => deleteLink(index)}
          aria-label={`Delete link ${index + 1}`}
        >
          <FontAwesomeIcon icon={["fas", "times"]} size="xs" />
        </button>
      </div>

      <div className={styles.cardBody}>
        <TextField
          type="text"
          value={link.text}
          className={styles.textField}
          variant="filled"
          size="small"
          placeholder="Link text"
          onChange={(e) => {
            const newLinks = links.slice();
            newLinks[index].text = e.target.value;
            setLinks(newLinks);
          }}
        />
        <TextField
          type="text"
          value={link.href}
          className={styles.textField}
          variant="filled"
          size="small"
          placeholder="Link URL"
          onChange={(e) => {
            const newLinks = links.slice();
            newLinks[index].href = e.target.value;
            setLinks(newLinks);
          }}
        />
        <Select
          className={styles.iconOptionSelect}
          onChange={(e) => {
            const newLinks = links.slice();
            newLinks[index].icon = e.target.value;
            setLinks(newLinks);
          }}
          defaultValue={selectOptions.find((obj) => obj.value === link?.icon)?.value}
        >
          {selectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value} className={styles.iconOption}>
              <ListItemText>{option.label}</ListItemText>
              <FontAwesomeIcon
                icon={option.value.split("_")}
                size="lg"
                className={styles.iconOptionIcon}
              />
            </MenuItem>
          ))}
        </Select>

        {(isSubscribed || true) /* TODO: remove OR condition when out of beta */ && (
          <div className={styles.liveSection}>
            <span className={styles.liveSectionLabel}>Live notification</span>
            <Select
              value={typeOfLiveNotification}
              onChange={(e) => {
                setTypeOfLiveNotification(e.target.value);
                const newLinks = links.slice();
                newLinks[index].live = Object.assign({}, newLinks[index].live, {
                  type: e.target.value,
                });
                setLinks(newLinks);
              }}
            >
              <MenuItem value={LIVE_TYPES.NONE}>None</MenuItem>
              <MenuItem value={LIVE_TYPES.TWITCH}>Twitch — show live status</MenuItem>
              <MenuItem value={LIVE_TYPES.YOUTUBE}>YouTube — show live status</MenuItem>
            </Select>
            {typeOfLiveNotification !== LIVE_TYPES.NONE && (
              <TextField
                className={styles.textField}
                variant="filled"
                size="small"
                value={liveMeta}
                onChange={(e) => {
                  setLiveMeta(e.target.value);
                  const newLinks = links.slice();
                  newLinks[index].live = Object.assign({}, newLinks[index].live, {
                    meta: e.target.value,
                  });
                  setLinks(newLinks);
                }}
                placeholder={
                  typeOfLiveNotification === LIVE_TYPES.TWITCH
                    ? "Twitch channel name"
                    : "YouTube channel ID"
                }
              />
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export default EditableLink;
