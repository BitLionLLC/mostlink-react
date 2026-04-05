import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useGoogleLogout } from "react-google-login";
import { toast } from "react-toastify";
import { SitesContext } from "../contexts/sitesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import lightLogo from "./assets/logo-light.png";
import darkLogo from "./assets/logo-dark.png";

import styles from "./singleSiteHeader.module.css";
import { SITE_EDITOR_TABS } from "../constants/siteEditorTabs";

const SingleSiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: siteId } = useParams();

  const {
    jwtToken,
    setJwtToken,
    setUserId,
    theme,
    themeObj,
    toggleTheme,
    siteLoading,
    singleSiteTabIndex,
  } = useContext(SitesContext);
  const [isAccountMenuShown, setIsAccountMenuShown] = useState(false);
  const [isHamburgerMenuShown, setIsHamburgerMenuShown] = useState(false);
  let jwtTokenRef = useRef(jwtToken);
  const accountWrapRef = useRef(null);

  const { signOut } = useGoogleLogout({
    jsSrc: "https://apis.google.com/js/api.js",
    onFailure: (err) => toast(err, { type: "error", theme }),
    clientId:
      "481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com",
    redirectUri: "/",
    onLogoutSuccess: () => {},
  });

  const onLogOut = () => {
    signOut();
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/users/logout`, {
        withCredentials: true,
      })
      .then(() => {
        toast("Successfully logged out.", { type: "success", theme });
      });

    setJwtToken(null);
    setUserId(null);
    localStorage.removeItem("mostlinkUserId");

    navigate("/");
  };

  const toggleAccountMenu = (e) => {
    e.stopPropagation();
    setIsAccountMenuShown(!isAccountMenuShown);
  };

  const toggleHamburgerMenu = (e) => {
    e.stopPropagation();
    setIsHamburgerMenuShown(!isHamburgerMenuShown);
  };

  const routeTo = (path) => {
    setIsHamburgerMenuShown(false);
    navigate(path);
  };

  useEffect(() => {
    if (isHamburgerMenuShown) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isHamburgerMenuShown]);

  useEffect(() => {
    if (!isAccountMenuShown) {
      return;
    }
    const onDoc = (e) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(e.target)) {
        setIsAccountMenuShown(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [isAccountMenuShown]);

  useEffect(() => {
    jwtTokenRef.current = jwtToken;

    const allowedPathsWhenLoggedOut = [
      "/account/login",
      "/account/register",
      "/account/reset-password",
      "/account/forgot-password",
      "/account/please-verify",
      "/account/verify-email",
      "/account/resend-verification",
      "/pricing",
      "/privacy-policy",
      "/terms-and-conditions",
      "/feedback",
    ];

    setTimeout(() => {
      if (!jwtTokenRef.current) {
        const matches = allowedPathsWhenLoggedOut.filter((path) =>
          location.pathname.startsWith(path)
        );

        if (!matches.length) {
          navigate("/");
        }
      }
    }, 1000);
  }, [jwtToken]);

  const accent = themeObj.accentColor;

  return siteLoading ? null : (
    <header
      className={styles.shell}
      style={{ backgroundColor: themeObj.headerColor, color: themeObj.color }}
    >
      <div className={styles.topRow}>
        <div className={styles.logoWrap}>
          <Link to={jwtToken ? "/dashboard" : "/"} style={{ color: themeObj.color }}>
            <img
              src={theme === "light" ? lightLogo : darkLogo}
              className={styles.logo}
              alt="Mostlink — home"
            />
          </Link>
        </div>

        <nav className={styles.desktopNav} aria-label="Site editor sections">
          {SITE_EDITOR_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${
                singleSiteTabIndex === tab.id ? styles.tabBtnActive : ""
              }`}
              style={{
                backgroundColor: accent,
                color: theme === "dark" ? "#111827" : "#ffffff",
              }}
              onClick={() => navigate(`/site/${siteId}/${tab.slug}`)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.desktopActions} ref={accountWrapRef}>
          <div
            className={styles.accountIcon}
            onClick={(e) => toggleAccountMenu(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleAccountMenu(e);
              }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isAccountMenuShown}
            aria-haspopup="true"
            aria-label="Account menu"
            style={{
              color: jwtToken && themeObj.loggedInColor,
            }}
          >
            <FontAwesomeIcon
              icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}
            />
          </div>

          <div
            className={styles.themeIcon}
            onClick={toggleTheme}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTheme();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            <FontAwesomeIcon
              icon={theme === "dark" ? ["fas", "sun"] : ["fas", "moon"]}
            />
          </div>

          <div
            style={{
              display: isAccountMenuShown ? "block" : "none",
              backgroundColor: themeObj.menuColor,
              borderColor:
                theme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
            }}
            className={styles.accountMenu}
          >
            <ul className={styles.accountMenuList}>
              {jwtToken && (
                <li>
                  <Link to="/dashboard" style={{ color: themeObj.color }}>
                    Dashboard
                  </Link>
                </li>
              )}
              {jwtToken && (
                <li>
                  <Link to="/account" style={{ color: themeObj.color }}>
                    Account
                  </Link>
                </li>
              )}
              {!jwtToken && (
                <li>
                  <Link to="/account/register" style={{ color: themeObj.color }}>
                    Register
                  </Link>
                </li>
              )}
              {!jwtToken && (
                <li>
                  <Link to="/account/login" style={{ color: themeObj.color }}>
                    Log in
                  </Link>
                </li>
              )}
              {!jwtToken && (
                <li>
                  <Link
                    to="/account/resend-verification"
                    style={{ color: themeObj.color }}
                  >
                    Verify email
                  </Link>
                </li>
              )}
              {jwtToken && (
                <li
                  className={styles.logoutItem}
                  onClick={onLogOut}
                  style={{ color: themeObj.color, cursor: "pointer" }}
                >
                  Log out
                </li>
              )}
            </ul>
          </div>
        </div>

        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={(e) => toggleHamburgerMenu(e)}
          aria-expanded={isHamburgerMenuShown}
          aria-controls="single-site-drawer"
          aria-label={isHamburgerMenuShown ? "Close menu" : "Open menu"}
        >
          <FontAwesomeIcon
            icon={["fas", "bars"]}
            size="lg"
            color={theme === "light" ? "black" : "white"}
          />
        </button>
      </div>

      <div
        className={styles.mobileEditorTabs}
        role="tablist"
        aria-label="Editor sections"
      >
        {SITE_EDITOR_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={singleSiteTabIndex === tab.id}
            className={`${styles.mobileTabBtn} ${
              singleSiteTabIndex === tab.id ? styles.mobileTabBtnActive : ""
            }`}
            style={{
              backgroundColor: themeObj.editTrayBackground,
              color: themeObj.color,
            }}
            onClick={() => navigate(`/site/${siteId}/${tab.slug}`)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isHamburgerMenuShown ? (
        <>
          <div
            className={styles.hamburgerBackdrop}
            onClick={() => setIsHamburgerMenuShown(false)}
            aria-hidden
          />
          <div
            id="single-site-drawer"
            className={styles.hamburgerPanel}
            style={{
              backgroundColor: themeObj.menuColor,
              color: themeObj.color,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className={styles.hamburgerHeader}>
              <span
                className={styles.hamburgerTitle}
                style={{ color: themeObj.color }}
              >
                Menu
              </span>
              <button
                type="button"
                className={styles.hamburgerMenuClose}
                onClick={() => setIsHamburgerMenuShown(false)}
                style={{
                  color: themeObj.color,
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                }}
                aria-label="Close menu"
              >
                <FontAwesomeIcon icon={["fas", "times"]} />
              </button>
            </div>
            <ul className={styles.hamburgerMenuList}>
              <li className={styles.doubleListItem}>
                <div
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                  }}
                  className={styles.hamburgerMenuItemHalf}
                  aria-hidden
                >
                  <FontAwesomeIcon
                    icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                  }}
                  className={styles.hamburgerMenuItemHalf}
                  aria-label={
                    theme === "dark"
                      ? "Switch to light theme"
                      : "Switch to dark theme"
                  }
                >
                  <FontAwesomeIcon
                    icon={theme === "dark" ? ["fas", "sun"] : ["fas", "moon"]}
                  />
                </button>
              </li>
              <li
                className={styles.hamburgerSectionLabel}
                style={{ color: themeObj.color }}
              >
                Account
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo(jwtToken ? "/dashboard" : "/")}
              >
                {jwtToken ? "Dashboard" : "Home"}
              </li>
              {jwtToken && (
                <li
                  className={styles.hamburgerItem}
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                  }}
                  onClick={() => routeTo("/account")}
                >
                  Account settings
                </li>
              )}
              {!jwtToken && (
                <li
                  className={styles.hamburgerItem}
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                  }}
                  onClick={() => routeTo("/account/register")}
                >
                  Register
                </li>
              )}
              {!jwtToken && (
                <li
                  className={styles.hamburgerItem}
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                  }}
                  onClick={() => routeTo("/account/login")}
                >
                  Log in
                </li>
              )}
              {!jwtToken && (
                <li
                  className={styles.hamburgerItem}
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                  }}
                  onClick={() => routeTo("/account/resend-verification")}
                >
                  Verify email
                </li>
              )}
              {jwtToken && (
                <li
                  className={styles.hamburgerItem}
                  onClick={onLogOut}
                  style={{
                    color: themeObj.color,
                    background: themeObj.editTrayBackground,
                    cursor: "pointer",
                  }}
                >
                  Log out
                </li>
              )}
              <li className={styles.hamburgerDivider} aria-hidden />
              <li
                className={styles.hamburgerSectionLabel}
                style={{ color: themeObj.color }}
              >
                Editor
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => {
                  navigate(`/site/${siteId}/links`);
                  setIsHamburgerMenuShown(false);
                }}
              >
                Links
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => {
                  navigate(`/site/${siteId}/style`);
                  setIsHamburgerMenuShown(false);
                }}
              >
                Style
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => {
                  navigate(`/site/${siteId}/analytics`);
                  setIsHamburgerMenuShown(false);
                }}
              >
                Analytics
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => {
                  navigate(`/site/${siteId}/settings`);
                  setIsHamburgerMenuShown(false);
                }}
              >
                Settings
              </li>
              <li className={styles.hamburgerDivider} aria-hidden />
              <li
                className={styles.hamburgerSectionLabel}
                style={{ color: themeObj.color }}
              >
                Site
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => setIsHamburgerMenuShown(false)}
              >
                <a href="/#features">Features</a>
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => setIsHamburgerMenuShown(false)}
              >
                <a href="/#examples">Examples</a>
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => setIsHamburgerMenuShown(false)}
              >
                <a href="/#faqs">FAQ&apos;s</a>
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/pricing")}
              >
                Pricing
              </li>
              <li className={styles.hamburgerDivider} aria-hidden />
              <li
                className={styles.hamburgerSectionLabel}
                style={{ color: themeObj.color }}
              >
                More
              </li>
              <li
                className={`${styles.hamburgerItem} ${styles.feedback}`}
                onClick={() => routeTo("/feedback")}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
              >
                Provide feedback (please!)
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/privacy-policy")}
              >
                Privacy Policy
              </li>
              <li
                className={styles.hamburgerItem}
                style={{
                  color: themeObj.color,
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/terms-and-conditions")}
              >
                Terms and Conditions
              </li>
            </ul>
          </div>
        </>
      ) : null}
    </header>
  );
};

export default SingleSiteHeader;
