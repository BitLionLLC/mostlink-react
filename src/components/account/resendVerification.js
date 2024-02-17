import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SitesContext } from "../../contexts/sitesContext";
import { TextField } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

import styles from "./resendVerification.module.css";

const ResendVerification = () => {
  const navigate = useNavigate();
  const { themeObj, theme } = useContext(SitesContext);
  const [email, setEmail] = useState("");

  const onCancel = () => {
    navigate("/");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    email &&
      axios
        .post(
          `${process.env.REACT_APP_API_BASE}/api/users/resend-verification`,
          {
            email,
          },
          { withCredentials: true }
        )
        .then((res) => {
          navigate("/account/please-verify");
          toast("Email verification re-sent. Please verify your email.", {
            type: "success",
            theme,
          });
        })
        .catch((err) => {
          if (
            err.response.data.error ===
            "Your email is already verified. Please log in."
          ) {
            navigate("/account/login");
          }
          toast(err.response.data.error, { type: "error", theme });
        });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  return (
    <div className={styles.resendVerificationContainer}>
      <div
        className={styles.resendVerification}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <h1>Resend account verification email</h1>
        <form
          className={styles.resendForm}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
        >
          <label htmlFor="email">Email address* (must be verified)</label>
          <TextField
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            variant="filled"
            size="small"
            className={styles.textField}
          />
          <div className={styles.resendFormButtons}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={!email}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResendVerification;
