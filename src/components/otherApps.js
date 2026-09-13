import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { SitesContext } from "../contexts/sitesContext";

import styles from "./otherApps.module.css";

const APPS_BASE_URL = "https://www.bitlion.us";
const ALL_LINKS_URL = "https://www.bitlion.us";

// apps.json is served without CORS headers, so it is proxied same-origin
// (netlify.toml in production, src/setupProxy.js in development). The direct
// URL is kept as a fallback in case the proxy is unavailable.
const APPS_JSON_URLS = ["/bitlion-apps.json", `${APPS_BASE_URL}/apps.json`];

// This project — hide it from its own "other apps" list.
const CURRENT_PROJECT_ID = "mostlink";

const SECTIONS = [
  { key: "apps", title: "Apps" },
  { key: "extensions", title: "Browser extensions" },
  { key: "saas", title: "Web apps" },
];

const absoluteUrl = (url) => {
  if (!url) {
    return null;
  }
  return url.startsWith("http") ? url : `${APPS_BASE_URL}${url}`;
};

const getStoreLinks = (item) =>
  [
    { label: "App Store", url: item.appStoreUrl },
    { label: "Google Play", url: item.playStoreUrl },
    { label: "Chrome Web Store", url: item.chromeWebStoreUrl },
    { label: "Firefox Add-ons", url: item.firefoxAddonUrl },
    { label: "Edge Add-ons", url: item.edgeAddonUrl },
    { label: "Website", url: item.websiteUrl },
  ].filter((link) => Boolean(link.url));

const OtherApps = () => {
  const { themeObj, theme } = useContext(SitesContext);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme, themeObj.landingBackground]);

  useEffect(() => {
    let isActive = true;

    const fetchApps = async () => {
      for (const url of APPS_JSON_URLS) {
        try {
          const { data } = await axios.get(url);

          if (!isActive) {
            return;
          }

          setSections(
            SECTIONS.map(({ key, title }) => ({
              key,
              title,
              items: (data[key] || []).filter(
                (item) => item.id !== CURRENT_PROJECT_ID
              ),
            })).filter((section) => section.items.length > 0)
          );
          setIsLoading(false);
          return;
        } catch (err) {
          // Try the next source.
        }
      }

      if (!isActive) {
        return;
      }

      setHasError(true);
      setIsLoading(false);
    };

    fetchApps();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className={styles.otherAppsContainer}>
      <div
        className={styles.shell}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <header className={styles.hero}>
          <p className={styles.eyebrow}>BitLion, LLC</p>
          <h1 className={styles.title}>Check out our other apps</h1>
          <p className={styles.lede}>
            Mostlink is one of several things we build. Here&apos;s everything
            else from the same workshop.
          </p>
          <a
            className={styles.allLinks}
            href={ALL_LINKS_URL}
            target="_blank"
            rel="noreferrer"
            style={{ backgroundColor: themeObj.accentColor }}
          >
            All links
          </a>
        </header>

        {isLoading && <p className={styles.status}>Loading our other apps…</p>}

        {hasError && (
          <p className={styles.status}>
            We couldn&apos;t load the list right now. You can see everything on{" "}
            <a
              href={ALL_LINKS_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: themeObj.accentColor }}
            >
              bitlion.us
            </a>
            .
          </p>
        )}

        {sections.map((section) => (
          <section key={section.key} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.cardList}>
              {section.items.map((item) => {
                const icon = absoluteUrl(item.icon);
                const storeLinks = getStoreLinks(item);

                return (
                  <li
                    key={item.id}
                    className={styles.card}
                    style={{ backgroundColor: themeObj.bodyColor }}
                  >
                    <div className={styles.cardHeader}>
                      {icon && (
                        <img
                          className={styles.icon}
                          src={icon}
                          alt={`${item.title} icon`}
                          loading="lazy"
                        />
                      )}
                      <div className={styles.cardHeading}>
                        <div className={styles.titleRow}>
                          <h3 className={styles.cardTitle}>{item.title}</h3>
                          {item.comingSoon && (
                            <span
                              className={styles.chip}
                              style={{
                                borderColor:
                                  item.accentColor || themeObj.accentColor,
                                color: item.accentColor || themeObj.accentColor,
                              }}
                            >
                              Coming soon
                            </span>
                          )}
                        </div>
                        {item.tagline && (
                          <p className={styles.tagline}>{item.tagline}</p>
                        )}
                        {item.category && (
                          <p className={styles.category}>{item.category}</p>
                        )}
                      </div>
                    </div>

                    {(item.shortDescription || item.description) && (
                      <p className={styles.description}>
                        {item.shortDescription || item.description}
                      </p>
                    )}

                    {storeLinks.length > 0 && (
                      <div className={styles.links}>
                        {storeLinks.map((link) => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.storeLink}
                            style={{
                              color: item.accentColor || themeObj.accentColor,
                              borderColor:
                                item.accentColor || themeObj.accentColor,
                            }}
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <footer className={styles.pageFooter}>
          <p>
            Everything we make lives at{" "}
            <a
              href={ALL_LINKS_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: themeObj.accentColor }}
            >
              bitlion.us
            </a>
            .
          </p>
          <Link to="/" style={{ color: themeObj.accentColor }}>
            ← Back to home
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default OtherApps;
