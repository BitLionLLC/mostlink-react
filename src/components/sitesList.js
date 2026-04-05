import React, { useContext, useEffect } from "react";
import { SitesContext } from "../contexts/sitesContext";
import { Link } from "react-router-dom";
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
          {sites.map((site, i) => {
            return (
              <Link
                to={`/site/${site._id}/links`}
                className={styles.siteLink}
                key={site._id}
              >
                <li key={site._id} className={styles.siteBox}>
                  <h2 className={styles.title}>{site.title}</h2>
                  <p className={styles.subtitle}>
                    {site.subtitle || "subtitle"}
                  </p>
                  <MiniSite site={site} />
                </li>
              </Link>
            );
          })}
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
