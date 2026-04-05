import React, { useContext, useEffect } from "react";
import { SitesContext } from "../contexts/sitesContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateSite from "./createSite";
import styles from "./sitesList.module.css";
import MiniSite from "./miniSite";

const SitesList = () => {
  const {
    sites,
    sitesLoading,
    fetchSites,
    themeObj,
    createSiteModalRef,
    setIsEditModalOpen,
  } = useContext(SitesContext);

  useEffect(() => {
    fetchSites();
  }, []);

  const onEscKey = (e) => {
    if (e.key === "Escape") {
      setIsEditModalOpen(false);
    }
  };

  return (
    <div
      className={styles.sitesContainer}
      ref={createSiteModalRef}
      onKeyDown={onEscKey}
      tabIndex="0"
    >
      {sitesLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.ldsCircle}>
            <div></div>
          </div>
        </div>
      ) : sites.length ? (
        <ul className={styles.sitesList}>
          {sites.map((site) => (
            <li key={site._id} className={styles.siteListItem}>
              <Link
                to={`/site/${site._id}/links`}
                className={styles.siteLink}
                title={`Open editor — ${site.title}`}
                aria-label={`Open site editor for ${site.title}`}
              >
                <div className={styles.siteBox}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.title}>{site.title}</h2>
                    <p className={styles.subtitle}>{site.subtitle || ""}</p>
                  </div>
                  <div className={styles.previewWrap}>
                    <MiniSite site={site} />
                  </div>
                  <div className={styles.cardFooter}>
                    <FontAwesomeIcon
                      icon={["fas", "pen-to-square"]}
                      className={styles.cardFooterIcon}
                      aria-hidden
                    />
                    <span>Open in editor</span>
                    <FontAwesomeIcon
                      icon={["fas", "chevron-right"]}
                      className={styles.cardFooterChevron}
                      aria-hidden
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptySitesContainer}>
          <div
            className={styles.emptySites}
            style={{ backgroundColor: themeObj.landingCardBackground }}
          >
            <div className={styles.titleAndCreate}>
              <h2>Create a site with the</h2>
              <CreateSite className="createSiteClone" />
            </div>
            <h2 className={styles.justTitle}>button to get started!</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesList;
