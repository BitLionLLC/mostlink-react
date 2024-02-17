import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SitesContext } from "../../contexts/sitesContext";

import styles from "./verifyEmail.module.css";

const VerifyEmail = () => {
  const match = useParams();
  const { hash, userId } = match.params;
  const [isActive, setIsActive] = useState(false);
  const { themeObj, theme } = useContext(SitesContext);

  useEffect(() => {
    if (hash && userId) {
      axios
        .post(
          `${process.env.REACT_APP_API_BASE}/api/users/verify-email`,
          { hash, userId },
          { withCredentials: true }
        )
        .then(() => {
          setIsActive(true);
          toast("Email verified!", { type: "success", theme });
        })
        .catch((err) => {
          toast("Could not verify your email.", { type: "error", theme });
        });
    }
  }, [hash, userId]);

  return (
    <div className={styles.verifyEmailContainer}>
      {isActive ? (
        <div
          className={styles.verifyEmail}
          style={{ backgroundColor: themeObj.landingCardBackground }}
        >
          <h1>
            Your email has been verified. Please{" "}
            <Link to="/account/login" style={{ color: themeObj.accentColor }}>
              log in
            </Link>
            .
          </h1>
        </div>
      ) : (
        <div
          className={styles.verifyEmail}
          style={{ backgroundColor: themeObj.landingCardBackground }}
        >
          <h1>Verifying your email...</h1>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
