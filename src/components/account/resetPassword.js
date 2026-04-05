import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
import {
  PASSWORD_REQUIREMENTS_TOOLTIP_HTML,
  PASSWORD_REQUIREMENTS_TOOLTIP_ID,
} from "../../constants/passwordTooltip";
import { SitesContext } from "../../contexts/sitesContext";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";

import styles from "./resetPassword.module.css";

const ResetPassword = () => {
  const { themeObj, theme } = useContext(SitesContext);
  const match = useParams();
  const { token, userId } = match.params;
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordShowing, setIsPasswordShowing] = useState(false);

  const PASSWORD_REGEX =
    "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$";
  const PASSWORD_ERROR = "This password does not meet the requirements.";

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme]);

  useEffect(() => {
    if (password && !password.match(PASSWORD_REGEX)) {
      setPasswordError(PASSWORD_ERROR);
    } else {
      setPasswordError("");
    }
  }, [password]);

  const onSubmit = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/users/forgot-password/reset`,
        { token, userId, password },
        { withCredentials: true }
      )
      .then((res) => {
        toast("Password successfully reset. Refresh and you'll log in.", {
          type: "success",
          theme,
        });
        navigate("/");
      })
      .catch((err) => {
        toast("Could not create reset your password. Try again.", {
          type: "error",
          theme,
        });
      });
  };

  const onCancel = () => {
    navigate("/");
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <div
        className={styles.resetPassword}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <h1>Reset password</h1>
        <div className={styles.passwordAndTooltip}>
          <label htmlFor="password">Password*</label>
          <div
            style={{
              color: themeObj.bodyColor,
              backgroundColor: themeObj.color,
            }}
            className={styles.questionMarkTooltip}
            data-tooltip-id={PASSWORD_REQUIREMENTS_TOOLTIP_ID}
            data-tooltip-html={PASSWORD_REQUIREMENTS_TOOLTIP_HTML}
          >
            ?
          </div>
        </div>
        <div className={styles.passwordAndEyeIcon}>
          <TextField
            type={isPasswordShowing ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            variant="filled"
            size="small"
            className={styles.textField}
            error={!!passwordError}
            helperText={passwordError}
          />
          <FontAwesomeIcon
            color="black"
            icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]}
            onClick={() => setIsPasswordShowing(!isPasswordShowing)}
            className={styles.eyeIcon}
          />
        </div>

        <div className={styles.resetPasswordButtons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.submitButton}
            onClick={onSubmit}
            disabled={!password || passwordError}
          >
            Submit
          </button>
        </div>
        <Tooltip id={PASSWORD_REQUIREMENTS_TOOLTIP_ID} place="right" />
      </div>
    </div>
  );
};

export default ResetPassword;
