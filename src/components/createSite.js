import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { SitesContext } from "../contexts/sitesContext";
import TextField from "@mui/material/TextField";
import { Portal } from "@mui/material";

import styles from "./createSite.module.css";

const CreateSite = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainError, setSubdomainError] = useState("");
  const [isSubdomainValid, setIsSubdomainValid] = useState(true);
  const [suggestion, setSuggestion] = useState("");

  const {
    fetchSites,
    themeObj,
    foreverFree,
    sites,
    theme,
    createSiteModalRef,
    setIsCreateSiteModalOpen,
  } = useContext(SitesContext);

  useEffect(() => {
    setIsCreateSiteModalOpen(isModalOpen);
  }, [isModalOpen, setIsCreateSiteModalOpen]);

  const WHITESPACE_REGEX = /\s/;
  const SUBDOMAIN_TAKEN_ERROR =
    "That subdomain is taken. Please choose another one.";

  useEffect(() => {
    if (!subdomain) {
      setIsSubdomainValid(true);
    }

    const delayDebounceFn = setTimeout(() => {
      subdomain &&
        axios
          .get(
            `${process.env.REACT_APP_API_BASE}/api/sites/register-subdomain/${subdomain}`,
            { withCredentials: true }
          )
          .then(() => {
            setIsSubdomainValid(true);
            setSubdomainError("");
          })
          .catch((err) => {
            setIsSubdomainValid(false);
            setSuggestion(err.response.data.suggestion);
            setSubdomainError(SUBDOMAIN_TAKEN_ERROR);
          });
    }, 1000);

    if (subdomain?.match(WHITESPACE_REGEX)) {
      setSubdomainError("No spaces allowed.");
    } else {
      setSubdomainError("");
    }

    return () => clearTimeout(delayDebounceFn);
  }, [subdomain]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const createSite = (e) => {
    const links = [
      {
        href: "https://www.google.com",
        text: "Google",
        icon: "fab_google",
        id: 0,
      },
      {
        href: "https://www.youtube.com",
        text: "YouTube",
        icon: "fab_youtube",
        id: 1,
      },
      {
        href: "https://www.twitch.tv",
        text: "Twitch",
        icon: "fab_twitch",
        id: 2,
      },
    ];

    e.preventDefault();
    if (!isSubdomainValid) {
      return;
    }

    const payload = {
      title,
      subtitle,
      links,
      subdomain,
      titlesColor: "#000000",
      containerColor: "#ADD8E6",
      linkTextColor: "#000000",
      linkBackgroundColor: "#FFFFFF",
      bodyColor: "#2E8B57",
    };

    if (sites.length === 0 && !foreverFree) {
      axios
        .post(
          `${process.env.REACT_APP_API_BASE}/api/payment/create-first-site-checkout`,
          payload,
          { withCredentials: true }
        )
        .then((res) => {
          window.location.href = res.data.redirect;
        })
        .catch((err) => {
          const msg =
            err.response?.data?.error?.message ||
            err.response?.data?.error ||
            "Could not start checkout.";
          toast(String(msg), { type: "error", theme });
        });
      return;
    }

    if (sites.length >= 1 && !foreverFree) {
      axios
        .post(
          `${process.env.REACT_APP_API_BASE}/api/payment/create-additional-site-checkout`,
          payload,
          { withCredentials: true }
        )
        .then((res) => {
          window.location.href = res.data.redirect;
        })
        .catch((err) => {
          const msg =
            err.response?.data?.error?.message ||
            err.response?.data?.error ||
            "Could not start checkout.";
          toast(String(msg), { type: "error", theme });
        });
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/sites`,
        payload,
        { withCredentials: true }
      )
      .then(() => {
        setIsModalOpen(false);
        toast("Site created!", { type: "success", theme });
        setTitle("");
        setSubtitle("");
        setSubdomain("");
        fetchSites();
      })
      .catch((err) => {
        const data = err.response?.data;
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message || "Could not create the site.";
        toast(msg, { type: "error", theme });
      });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      createSite(e);
    }
  };

  const onEscKey = (e) => {
    if (e.key === "Escape") {
      toggleModal();
    }
  };

  return (
    <div onKeyDown={onEscKey} tabIndex="0">
      <div
        className={styles[props.className] || styles.createSite}
        onClick={toggleModal}
        style={{
          color: themeObj.accentColor,
          backgroundColor: themeObj.bodyColor,
          cursor: "pointer",
        }}
      >
        +
      </div>
      {isModalOpen ? (
        <>
          <div className={styles.blocker} onClick={toggleModal}></div>
          <Portal container={createSiteModalRef.current}>
            <div
              className={styles.createSiteModal}
              onKeyDown={onEscKey}
              tabIndex="0"
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={toggleModal}
                aria-label="Close"
              >
                <span className={styles.closeButtonGlyph}>+</span>
              </button>
              <h1>Create a site</h1>
              {!foreverFree && sites.length === 0 ? (
                <p className={styles.checkoutHint}>
                  Next you&apos;ll go to Stripe to start your 30-day free trial
                  ($5/mo for your first site after; $1/mo per extra site).
                </p>
              ) : !foreverFree && sites.length >= 1 ? (
                <p className={styles.checkoutHint}>
                  Next you&apos;ll go to Stripe to subscribe for this additional
                  site ($1/mo, no trial).
                </p>
              ) : null}
              <form
                onSubmit={createSite}
                className={styles.createSiteForm}
                onKeyDown={onKeyDown}
              >
                <TextField
                  type="text"
                  className={styles.textField}
                  value={title}
                  name="title"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Site title"
                  variant="filled"
                  size="small"
                />
                <TextField
                  type="text"
                  className={styles.textField}
                  value={subtitle}
                  name="subtitle"
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtitle"
                  variant="filled"
                  size="small"
                />
                <div className={styles.siteAndPath}>
                  <TextField
                    type="text"
                    className={styles.textField}
                    value={subdomain}
                    name="subdomain"
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="subdomain"
                    variant="filled"
                    size="small"
                    error={!isSubdomainValid || subdomainError}
                    helperText={subdomainError}
                  />
                  .mostlink.co
                </div>
                {subdomain && subdomainError === SUBDOMAIN_TAKEN_ERROR && (
                  <div
                    onClick={() => setSubdomain(suggestion)}
                    className={styles.suggestion}
                  >
                    How about {suggestion}?
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={
                    !title ||
                    !subtitle ||
                    !subdomain ||
                    !isSubdomainValid ||
                    subdomainError
                  }
                >
                  Create
                </button>
              </form>
            </div>
          </Portal>
        </>
      ) : null}
    </div>
  );
};

export default CreateSite;
