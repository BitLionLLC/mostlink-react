import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import defaultHeader from "./assets/default-header.png";
import iPhoneImage from "./assets/iphone.png";
import { imageFieldSrc } from "../utils/imageField";

import styles from "./sitePreview.module.css";

/**
 * Read-only render of a site on the same logical 350×700 canvas as the site
 * editor preview, scaled down by the caller's wrapper. Shared by the dashboard
 * card (miniSite) and the landing page examples.
 */
const SitePreview = ({ site }) => {
  const {
    title,
    subtitle,
    headerImage,
    headerEmoji,
    links,
    titlesColor,
    containerColor,
    linkTextColor,
    linkBackgroundColor,
    containerGradient,
    liveNotificationColor,
  } = site;

  return (
    <div className={styles.phoneOuter}>
      <div className={styles.phoneInner}>
        <div
          className={styles.phoneScreen}
          style={{
            backgroundColor: !containerGradient && containerColor,
            backgroundImage: containerGradient || undefined,
          }}
        >
          <img
            src={iPhoneImage}
            className={styles.phoneFrameImg}
            alt=""
            draggable={false}
          />
          <div className={styles.phoneContents}>
            {headerEmoji ? (
              <div className={styles.previewHeaderEmoji}>{headerEmoji}</div>
            ) : (
              <img
                src={imageFieldSrc(headerImage) || defaultHeader}
                alt=""
                width={200}
                height={200}
                className={styles.previewHeaderImg}
              />
            )}
            <div className={styles.previewTitle} style={{ color: titlesColor }}>
              {title}
            </div>
            <div className={styles.previewSubtitle} style={{ color: titlesColor }}>
              {subtitle}
            </div>
            <ul className={styles.previewLinksList}>
              {(links || []).map((link, i) => (
                <li
                  key={i}
                  className={styles.previewLink}
                  style={{
                    color: linkTextColor,
                    backgroundColor: linkBackgroundColor,
                  }}
                >
                  <div className={styles.previewLinkTextWrap}>
                    <span className={styles.previewLinkText}>{link.text}</span>
                    {link.live ? (
                      <span className={styles.previewLive}>
                        {link.live.isLive ? (
                          <>
                            <span> — </span>
                            <span style={{ color: liveNotificationColor }}>
                              LIVE!
                            </span>
                          </>
                        ) : (
                          <span> — not live</span>
                        )}
                      </span>
                    ) : null}
                  </div>
                  <FontAwesomeIcon icon={link?.icon?.split("_")} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePreview;
