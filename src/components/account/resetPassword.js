import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
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
          <Tooltip place="right" html={true} />
          <div
            style={{
              color: themeObj.bodyColor,
              backgroundColor: themeObj.color,
            }}
            className={styles.questionMarkTooltip}
            data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>"
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
      </div>
    </div>
  );
};

export default ResetPassword;
