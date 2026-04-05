import React, { useEffect, useContext } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SitesContext } from "../../contexts/sitesContext";
import { toast } from "react-toastify";

import styles from "./paymentSuccess.module.css";

const PaymentSuccess = () => {
  const { setIsSubscribed, setForeverFree, fetchSites, theme, themeObj } =
    useContext(SitesContext);
  const [searchParams] = useSearchParams();
  const checkoutSessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [themeObj.landingBackground]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/users`, { withCredentials: true })
      .then((res) => {
        setIsSubscribed(res.data.isSubscribed);
        setForeverFree(Boolean(res.data.foreverFree));
        fetchSites();
      })
      .catch(() =>
        toast("Could not retrieve your subscription status.", { type: "error" })
      );
  }, [setIsSubscribed, setForeverFree, fetchSites]);

  const createPortalSession = () => {
    const base = `${process.env.REACT_APP_API_BASE}/api/payment/create-portal-session`;
    const url = checkoutSessionId
      ? `${base}?session_id=${encodeURIComponent(checkoutSessionId)}`
      : base;
    axios
      .get(url, { withCredentials: true })
      .then((res) => {
        window.location.href = res.data.redirect;
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error ||
          "Could not open the Stripe portal. Try again in a moment.";
        toast(msg, { type: "error", theme });
      });
  };

  return (
    <div className={styles.successContainer}>
      <div
        className={styles.success}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <div className={styles.checkCircle}>
          <svg
            className={styles.checkIcon}
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className={styles.checkCircleRing}
              cx="26"
              cy="26"
              r="24"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              className={styles.checkMark}
              d="M14 27l8 8 16-16"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <h1 className={styles.heading}>You're all set!</h1>
        <p className={styles.subtext}>
          Your payment went through. Welcome to premium — your sites are ready
          to go.
        </p>

        <div className={styles.buttonGroup}>
          <button className={styles.portalButton} onClick={createPortalSession}>
            Manage Subscription
          </button>
          <button
            className={styles.dashboardButton}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
