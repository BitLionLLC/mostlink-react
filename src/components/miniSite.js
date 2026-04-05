import React, { useContext } from "react";
import { SitesContext } from "../contexts/sitesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import defaultHeader from "./assets/default-header.png";
import iPhoneImage from "./assets/iphone.png";
import { imageFieldSrc } from "../utils/imageField";

import styles from "./miniSite.module.css";

/** Same logical canvas as the site editor preview (singleSite), scaled into the dashboard card */
const MiniSite = ({ site }) => {
  const {
    setIsEditModalOpen,
    setEditModalOpenedWith,
    isEditModalOpen,
    isCreateSiteModalOpen,
  } = useContext(SitesContext);

  const dashboardModalOpen = isEditModalOpen || isCreateSiteModalOpen;

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
    subdomain,
    _id,
  } = site;

  return (
    <div className={styles.miniSiteWrapper}>
      <div
        className={styles.editButton}
        role="button"
        tabIndex={dashboardModalOpen ? -1 : 0}
        aria-label="Edit site"
        style={{
          zIndex: dashboardModalOpen ? 1 : undefined,
          pointerEvents: dashboardModalOpen ? "none" : undefined,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditModalOpen(true);
          setEditModalOpenedWith({ title, subtitle, subdomain, id: _id });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setIsEditModalOpen(true);
            setEditModalOpenedWith({ title, subtitle, subdomain, id: _id });
          }
        }}
      >
        <FontAwesomeIcon icon={["far", "edit"]} size="xs" />
      </div>

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
              <div
                className={styles.previewSubtitle}
                style={{ color: titlesColor }}
              >
                {subtitle}
              </div>
              <ul className={styles.previewLinksList}>
                {links.map((link, i) => (
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
    </div>
  );
};

export default MiniSite;
