import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { TextField } from "@mui/material";
import { SitesContext } from "../../contexts/sitesContext";

import styles from "./forgotPassword.module.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { themeObj, theme } = useContext(SitesContext);
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme]);

  const onSubmit = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/users/forgot-password/initiate`,
        { email },
        { withCredentials: true }
      )
      .then((res) => {
        toast("Password reset initiated. Check your email inbox.", {
          type: "success",
        });
      })
      .catch((err) => {
        toast(
          "Could not intitiate a password reset. Check your email address and try again.",
          { type: "error" }
        );
      });
  };

  const onCancel = () => {
    navigate("/");
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div
        className={styles.forgotPassword}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <h1>Reset password</h1>
        <div className={styles.label}>
          <label htmlFor="email">Email*</label>
        </div>
        <TextField
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          className={styles.textField}
          size="small"
          variant="filled"
        />
        <div className={styles.forgotPasswordButtons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.submitButton}
            onClick={onSubmit}
            disabled={!email}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
