import React, { useContext } from "react";
import { SitesContext } from "../contexts/sitesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SitePreview from "./sitePreview";

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

  const { title, subtitle, subdomain, _id } = site;

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

      <SitePreview site={site} />
    </div>
  );
};

export default MiniSite;
