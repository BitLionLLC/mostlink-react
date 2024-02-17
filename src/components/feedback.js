import { Checkbox, MenuItem, Select, TextField } from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import FileBase64 from "react-file-base64";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SitesContext } from "../contexts/sitesContext";

import styles from "./feedback.module.css";

const Feedback = () => {
  const navigate = useNavigate();

  const { themeObj, theme } = useContext(SitesContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [okayToEmail, setOkayToEmail] = useState(false);
  const [feedbackType, setFeedbackType] = useState("featureRequest");
  const [comments, setComments] = useState("");
  const [screenshot, setScreenshot] = useState(null);

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
    navigate("/");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const data = {
      name,
      email,
      okayToEmail,
      feedbackType,
      comments,
      screenshot: screenshot?.base64 || null,
    };

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/feedback`, data)
      .then(() => {
        toast("Thanks! Successfully sent feedback.", {
          type: "success",
          theme,
        });
      })
      .catch(() => {
        toast("Could not send feedback. Please try again.", {
          type: "error",
          theme,
        });
      });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  return (
    <div className={styles.feedbackContainer}>
      <div
        className={styles.feedback}
        style={{ backgroundColor: themeObj.landingCardBackground }}
      >
        <h3>
          Thanks for being a beta tester! We really appreciate it. Please
          provide us with detailed feedback so we can improve the site builder
          for future users.
        </h3>
        <form
          className={styles.feedbackForm}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
        >
          <label>Name</label>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            variant="filled"
            className={styles.textField}
            placeholder="Name"
          />
          <label>Email address</label>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            variant="filled"
            className={styles.textField}
            placeholder="Email address"
          />
          <div>
            <label>Okay to email?</label>
            <Checkbox
              checked={okayToEmail}
              onChange={(e) => setOkayToEmail(e.target.checked)}
            />
          </div>
          <div>
            <label>Type of feedback</label>
            <Select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className={styles.typeSelect}
            >
              <MenuItem value="featureRequest">Feature Request</MenuItem>
              <MenuItem value="suggestion">Improvement/Suggestion</MenuItem>
              <MenuItem value="bugReport">Bug Report</MenuItem>
            </Select>
          </div>
          <label>Comments</label>
          <TextField
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            variant="filled"
            multiline={true}
            rows={10}
            maxRows={10}
            className={styles.commentField}
            placeholder="Comments"
          />
          <label>Screenshot upload</label>
          <FileBase64 multiple={false} onDone={(file) => setScreenshot(file)} />

          <div className={styles.loginFormButtons}>
            <button className={styles.cancelButton} onClick={onCancel}>
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
