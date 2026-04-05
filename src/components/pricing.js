import React, { useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SitesContext } from "../contexts/sitesContext";

import styles from "./pricing.module.css";

const TRIAL_POINTS = [
  "Full access to every feature while you explore",
  "Build and publish mini-sites right away",
  "No charge until your 30-day trial ends",
];

const PAID_POINTS = [
  "First site included at $5/mo — add more anytime",
  "Each extra site is only $1/mo",
  "Social live notices and stream-friendly tools",
  "Scale up or down as your needs change",
];

const Pricing = () => {
  const { themeObj, theme } = useContext(SitesContext);

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme]);

  return (
    <div className={styles.pricingContainer}>
      <div
        className={styles.shell}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 className={styles.title}>One plan. Clear math.</h1>
          <p className={styles.lede}>
            Start with a <strong>30-day free trial</strong>. After that, your
            first site is <strong>$5/mo</strong> and each additional site is{" "}
            <strong>$1/mo</strong>.
          </p>
        </header>

        <div className={styles.grid}>
          <article
            className={`${styles.card} ${styles.cardFeatured}`}
            style={{
              backgroundColor: themeObj.bodyColor,
              borderColor: themeObj.accentColor,
            }}
          >
            <span
              className={styles.badge}
              style={{ backgroundColor: themeObj.accentColor }}
            >
              30-day free trial
            </span>
            <h2 className={styles.cardTitle}>Try everything</h2>
            <p className={styles.priceRow}>
              <span className={styles.priceAmount}>$0</span>
              <span className={styles.priceSuffix}>for 30 days</span>
            </p>
            <ul className={styles.featureList}>
              {TRIAL_POINTS.map((text) => (
                <li key={text} className={styles.featureItem}>
                  <FontAwesomeIcon
                    icon={["fas", "check"]}
                    className={styles.check}
                    style={{ color: themeObj.accentColor }}
                    aria-hidden
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </article>

          <article
            className={styles.card}
            style={{ backgroundColor: themeObj.bodyColor }}
          >
            <h2 className={styles.cardTitle}>After your trial</h2>
            <div className={styles.priceStack}>
              <p className={styles.priceRow}>
                <span className={styles.priceAmount}>$5</span>
                <span className={styles.priceSuffix}>/mo · first site</span>
              </p>
              <p className={styles.addOn} style={{ color: themeObj.accentColor }}>
                + $1/mo each additional site
              </p>
            </div>
            <ul className={styles.featureList}>
              {PAID_POINTS.map((text) => (
                <li key={text} className={styles.featureItem}>
                  <FontAwesomeIcon
                    icon={["fas", "check"]}
                    className={styles.check}
                    style={{ color: themeObj.accentColor }}
                    aria-hidden
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
