import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SitesContext } from "../contexts/sitesContext";
import ReCaptcha from "./recaptcha";

import styles from "./feedback.module.css";

const SUPPORT_EMAIL = "grant@mostlink.co";
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

const Support = () => {
  const navigate = useNavigate();
  const { themeObj, theme } = useContext(SitesContext);

  const filledInputProps = { disableUnderline: true };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
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
  }, [theme, themeObj.landingBackground]);

  const onCancel = () => {
    setName("");
    setEmail("");
    setTopic("general");
    setMessage("");
    setWebsite("");
    resetCaptcha();
    navigate("/");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !message.trim()) {
      toast("Please enter your email and a message.", {
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

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/support`, {
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        recaptchaToken: captchaToken,
        website,
      })
      .then(() => {
        toast("Thanks — we got your message and will get back to you soon.", {
          type: "success",
          theme,
        });
        setName("");
        setEmail("");
        setTopic("general");
        setMessage("");
        setWebsite("");
        resetCaptcha();
      })
      .catch(() => {
        toast("Could not send your message. Please try again or email us.", {
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
        <h1>Support</h1>
        <p className={styles.feedbackIntro}>
          Questions about billing, your account, or the product? Send a message
          below or reach us directly at{" "}
          <a
            href={SUPPORT_MAILTO}
            style={{ color: themeObj.accentColor, fontWeight: 600 }}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <h3 className={styles.backLink} style={{ color: themeObj.accentColor }}>
          <Link to="/" style={{ color: themeObj.accentColor }}>
            ← Back to home
          </Link>
        </h3>
        <form className={styles.feedbackForm} onSubmit={onSubmit}>
          <label htmlFor="support-name">Name (optional)</label>
          <TextField
            id="support-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            variant="filled"
            className={styles.textField}
            placeholder="Your name"
            InputProps={filledInputProps}
          />

          <label htmlFor="support-email">Email address</label>
          <TextField
            id="support-email"
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

          <FormControl
            variant="filled"
            size="small"
            fullWidth
            className={styles.textField}
          >
            <InputLabel id="support-topic-label">Topic</InputLabel>
            <Select
              labelId="support-topic-label"
              value={topic}
              label="Topic"
              onChange={(e) => setTopic(e.target.value)}
              disableUnderline
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="billing">Billing & subscriptions</MenuItem>
              <MenuItem value="account">Account & login</MenuItem>
              <MenuItem value="technical">Technical issue</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <label htmlFor="support-message">Message</label>
          <TextField
            id="support-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="filled"
            required
            multiline
            minRows={6}
            className={styles.commentField}
            placeholder="How can we help?"
            InputProps={filledInputProps}
          />

          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="support-website">Leave this field empty</label>
            <input
              id="support-website"
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
              Send message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
