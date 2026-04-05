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

  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/users/forgot-password/initiate`,
        { email },
        { withCredentials: true }
      )
      .then(() => {
        toast("Password reset initiated. Check your email inbox.", {
          type: "success",
          theme,
        });
      })
      .catch(() => {
        toast(
          "Could not initiate a password reset. Check your email address and try again.",
          { type: "error", theme }
        );
      });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  const onCancel = () => {
    navigate("/");
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPassword}>
        <h1>Reset password</h1>
        <form
          className={styles.forgotPasswordForm}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
        >
          <label htmlFor="email">Email*</label>
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
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onCancel}
            >
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

export default ForgotPassword;
