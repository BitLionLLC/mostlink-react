import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SitesContext } from "../contexts/sitesContext";

import styles from "./footer.module.css";

const Footer = () => {
  const { themeObj, theme } = useContext(SitesContext);
  const location = useLocation();

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme]);

  return (
    <div className={styles.footer} style={{ background: themeObj.headerColor }}>
      <div style={{ color: themeObj.color }}>
        Copyright 2021-{new Date().getFullYear()}, BitLion, LLC
      </div>
      <div>
        <Link to="/privacy-policy" style={{ color: themeObj.color }}>
          Privacy Policy
        </Link>
      </div>
      <div>
        <Link to="/terms-and-conditions" style={{ color: themeObj.color }}>
          Terms and Conditions
        </Link>
      </div>
      <div>
        <Link to="/refund-policy" style={{ color: themeObj.color }}>
          Refund Policy
        </Link>
      </div>
      <div>
        <Link to="/support" style={{ color: themeObj.color }}>
          Support
        </Link>
      </div>
      {!location.pathname.includes("/feedback") && (
        <Link to="/feedback">
          <div className={styles.feedback}>
            <h2>Provide feedback (please!)</h2>
          </div>
        </Link>
      )}
    </div>
  );
};

export default Footer;
