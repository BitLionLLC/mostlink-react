import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { SitesContext } from "../../contexts/sitesContext";
import SitePreview from "../sitePreview";
import EXAMPLE_SUBDOMAINS from "../../constants/exampleSites";
import { publicSiteUrl, publicSiteLabel } from "../../utils/siteUrl";

import styles from "./examples.module.css";

/** Public site payload, same endpoint the hosted pages render from. */
const fetchExample = async (subdomain) => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_API_BASE}/api/sites/static/next/subdomain-${subdomain}`
  );
  // Parked sites (owner not billing) come back as { parking: true, site: null }.
  if (!data?.site) {
    return null;
  }
  return { ...data.site, links: data.links || data.site.links || [] };
};

const Examples = () => {
  const { themeObj } = useContext(SitesContext);
  const [examples, setExamples] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      EXAMPLE_SUBDOMAINS.map((subdomain) =>
        fetchExample(subdomain).catch(() => null)
      )
    ).then((results) => {
      if (!cancelled) {
        setExamples(results.filter(Boolean));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing to show beats an empty section, e.g. if the API is unreachable.
  if (!examples.length) {
    return null;
  }

  return (
    <div
      className={styles.examples}
      style={{ backgroundColor: themeObj.landingCardBackground }}
    >
      <div id="examples" className={styles.anchor} />
      <h1>Examples</h1>
      <ul className={styles.exampleList}>
        {examples.map((site) => (
          <li key={site.subdomain} className={styles.example}>
            <a
              href={publicSiteUrl(site.subdomain)}
              target="_blank"
              rel="noreferrer"
              style={{ color: themeObj.color }}
            >
              <SitePreview site={site} />
              <div className={styles.description}>
                <div className={styles.exampleTitle}>
                  {site.title || site.subdomain}
                </div>
                <div className={styles.exampleUrl}>
                  {publicSiteLabel(site.subdomain)}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Examples;
