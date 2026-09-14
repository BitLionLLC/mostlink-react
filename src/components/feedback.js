import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import FileBase64 from "react-file-base64";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SitesContext } from "../contexts/sitesContext";
import ReCaptcha from "./recaptcha";

import styles from "./feedback.module.css";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

const Feedback = () => {
  const navigate = useNavigate();

  const { themeObj, theme } = useContext(SitesContext);

  const filledInputProps = { disableUnderline: true };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [okayToEmail, setOkayToEmail] = useState(false);
  const [feedbackType, setFeedbackType] = useState("featureRequest");
  const [comments, setComments] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [captchaToken, setCaptchaToken] = useState("");
  // Honeypot — see .honeypot in feedback.module.css. Always empty for humans.
  const [website, setWebsite] = useState("");

  const captchaRef = useRef(null);

  const resetCaptcha = () => {
    captchaRef.current?.reset();
    setCaptchaToken("");
  };

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme]);

  const onCancel = () => {
    setName("");
    setEmail("");
    setOkayToEmail(false);
    setFeedbackType("featureRequest");
    setComments("");
    setScreenshot(null);
    setWebsite("");
    resetCaptcha();
    navigate("/");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !comments.trim()) {
      toast("Please enter your email and some comments.", {
        type: "error",
        theme,
      });
      return;
    }

    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      toast("Please confirm you are not a robot.", {
        type: "error",
        theme,
      });
      return;
    }

    const data = {
      name,
      email,
      okayToEmail,
      feedbackType,
      comments,
      screenshot: screenshot?.base64 || null,
      recaptchaToken: captchaToken,
      website,
    };

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/feedback`, data)
      .then(() => {
        toast("Thanks! Successfully sent feedback.", {
          type: "success",
          theme,
        });
        resetCaptcha();
      })
      .catch(() => {
        toast("Could not send feedback. Please try again.", {
          type: "error",
          theme,
        });
        // The token is single-use once the server checks it, so make the user
        // tick the box again before retrying.
        resetCaptcha();
      });
  };

  return (
    <div className={styles.feedbackContainer}>
      <div className={styles.feedback}>
        <h1>Feedback</h1>
        <p className={styles.feedbackIntro}>
          Thanks for being a beta tester — we really appreciate it. Detailed
          feedback helps us improve the site builder for everyone.
        </p>
        <h3 className={styles.backLink} style={{ color: themeObj.accentColor }}>
          <Link to="/" style={{ color: themeObj.accentColor }}>
            ← Back to home
          </Link>
        </h3>
        <form className={styles.feedbackForm} onSubmit={onSubmit}>
          <label htmlFor="feedback-name">Name</label>
          <TextField
            id="feedback-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            variant="filled"
            className={styles.textField}
            placeholder="Your name"
            InputProps={filledInputProps}
          />

          <label htmlFor="feedback-email">Email address</label>
          <TextField
            id="feedback-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            variant="filled"
            className={styles.textField}
            placeholder="you@example.com"
            InputProps={filledInputProps}
          />

          <FormControlLabel
            className={styles.checkboxRow}
            control={
              <Checkbox
                checked={okayToEmail}
                onChange={(e) => setOkayToEmail(e.target.checked)}
                color="primary"
              />
            }
            label="Okay to email me about this feedback"
          />

          <FormControl
            variant="filled"
            size="small"
            fullWidth
            className={styles.textField}
          >
            <InputLabel id="feedback-type-label">Type of feedback</InputLabel>
            <Select
              labelId="feedback-type-label"
              value={feedbackType}
              label="Type of feedback"
              onChange={(e) => setFeedbackType(e.target.value)}
              disableUnderline
            >
              <MenuItem value="featureRequest">Feature request</MenuItem>
              <MenuItem value="suggestion">Improvement / suggestion</MenuItem>
              <MenuItem value="bugReport">Bug report</MenuItem>
            </Select>
          </FormControl>

          <label htmlFor="feedback-comments">Comments</label>
          <TextField
            id="feedback-comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            variant="filled"
            required
            multiline
            minRows={8}
            className={styles.commentField}
            placeholder="What should we know?"
            InputProps={filledInputProps}
          />

          <label className={styles.fileFieldBlock}>
            <span className={styles.labelText}>Screenshot (optional)</span>
            <div className={styles.fileUpload}>
              <FileBase64
                multiple={false}
                onDone={(file) => setScreenshot(file)}
              />
              <p className={styles.fileHint}>
                PNG or JPG — helps a ton for bug reports.
              </p>
            </div>
          </label>

          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="feedback-website">Leave this field empty</label>
            <input
              id="feedback-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {RECAPTCHA_SITE_KEY ? (
            <div className={styles.captchaRow}>
              <ReCaptcha
                ref={captchaRef}
                siteKey={RECAPTCHA_SITE_KEY}
                theme={theme === "dark" ? "dark" : "light"}
                onChange={setCaptchaToken}
              />
            </div>
          ) : null}

          <div className={styles.loginFormButtons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button className={styles.submitButton} type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
