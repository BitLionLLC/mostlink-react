import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { SitesContext } from "../contexts/sitesContext";
import { useGoogleLogout } from "react-google-login";
import lightLogo from "./assets/logo-light.png";
import darkLogo from "./assets/logo-dark.png";

import styles from "./header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { jwtToken, setJwtToken, setUserId, theme, themeObj, toggleTheme } =
    useContext(SitesContext);
  const [isAccountMenuShown, setIsAccountMenuShown] = useState(false);
  const [isHamburgerMenuShown, setIsHamburgerMenuShown] = useState(false);
  let jwtTokenRef = useRef(jwtToken);

  const { signOut } = useGoogleLogout({
    jsSrc: "https://apis.google.com/js/api.js",
    onFailure: (err) => toast(err, { type: "error" }),
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
        toast("Successfully logged out.", { type: "success" });
      });

    setJwtToken(null);
    setUserId(null);
    localStorage.removeItem("mostlinkUserId");

    navigate("/");
  };

  useEffect(() => {
    document.body.addEventListener("click", () => setIsAccountMenuShown(false));

    return document.body.removeEventListener("click", () =>
      setIsAccountMenuShown(false)
    );
  }, []);

  useEffect(() => {
    if (!location.pathname.includes("site")) {
      document.body.style.backgroundColor = themeObj.bodyColor;
    }
  });

  useEffect(() => {
    document.body.style.backgroundColor = themeObj.bodyColor;
    document.body.style.color = themeObj.color;
  }, [theme]);

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

  return (
    <div
      className={styles.header}
      style={{ backgroundColor: themeObj.headerColor, color: themeObj.color }}
    >
      <div className={styles.logoAndTitle}>
        <Link to={jwtToken ? "/home" : "/"} style={{ color: themeObj.color }}>
          <img
            src={theme === "light" ? lightLogo : darkLogo}
            width="300"
            alt="Mostlink logo"
          />
        </Link>
      </div>
      <div className={styles.iconRow}>
        <a
          href="/#features"
          className={styles.link}
          style={{ backgroundColor: themeObj.accentColor }}
        >
          Features
        </a>
        <a
          href="/#examples"
          className={styles.link}
          style={{ backgroundColor: themeObj.accentColor }}
        >
          Examples
        </a>
        <a
          href="/#faqs"
          className={styles.link}
          style={{ backgroundColor: themeObj.accentColor }}
        >
          FAQ's
        </a>
        <Link
          to="/pricing"
          className={styles.link}
          style={{ backgroundColor: themeObj.accentColor }}
        >
          Pricing
        </Link>
        <div
          className={styles.accountIcon}
          onClick={(e) => toggleAccountMenu(e)}
          style={{
            right: jwtToken ? "15px" : "18px",
            color: jwtToken && themeObj.loggedInColor,
          }}
        >
          <FontAwesomeIcon
            icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}
          />
        </div>
        <div className={styles.themeIcon} onClick={toggleTheme}>
          <FontAwesomeIcon
            icon={theme === "dark" ? ["fas", "sun"] : ["fas", "moon"]}
          />
        </div>

        <div
          style={{
            display: isAccountMenuShown ? "block" : "none",
            backgroundColor: themeObj.menuColor,
          }}
          className={styles.accountMenu}
        >
          <div
            className={styles.attachTriangle}
            style={{ backgroundColor: themeObj.menuColor }}
          ></div>
          <ul className={styles.accountMenuList}>
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
                <Link
                  to="/account/resend-verification"
                  style={{ color: themeObj.color }}
                >
                  Verify email
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
            {jwtToken && (
              <li
                onClick={onLogOut}
                style={{ color: themeObj.color, cursor: "pointer" }}
              >
                Log out
              </li>
            )}
          </ul>
        </div>
      </div>
      <FontAwesomeIcon
        icon={["fas", "bars"]}
        className={styles.hamburgerMenu}
        size="2x"
        onClick={(e) => toggleHamburgerMenu(e)}
        color={theme === "light" ? "black" : "white"}
      />
      {isHamburgerMenuShown ? (
        <>
          <div
            className={styles.hamburgerMenuClose}
            onClick={(e) => setIsHamburgerMenuShown(false)}
            style={{ color: theme === "light" ? "black" : "white" }}
          >
            +
          </div>
          <ul
            className={styles.hamburgerMenuList}
            style={{ backgroundColor: themeObj.menuColor }}
          >
            <div className={styles.doubleListItem}>
              <li
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                }}
                className={styles.hamburgerMenuItemHalf}
              >
                <FontAwesomeIcon
                  icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}
                />
              </li>
              <li
                onClick={toggleTheme}
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                }}
                className={styles.hamburgerMenuItemHalf}
              >
                <FontAwesomeIcon
                  icon={theme === "dark" ? ["fas", "sun"] : ["fas", "moon"]}
                />
              </li>
            </div>
            <li
              style={{
                color: "white",
                background: themeObj.editTrayBackground,
              }}
              onClick={() => routeTo(jwtToken ? "/home" : "/")}
            >
              {jwtToken ? "Dashboard" : "Home"}
            </li>
            {jwtToken && (
              <li
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/account")}
              >
                Account
              </li>
            )}
            {!jwtToken && (
              <li
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/account/register")}
              >
                Register
              </li>
            )}
            {!jwtToken && (
              <li
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/account/resend-verification")}
              >
                Verify email
              </li>
            )}
            {!jwtToken && (
              <li
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                }}
                onClick={() => routeTo("/account/login")}
              >
                Log in
              </li>
            )}
            {jwtToken && (
              <li
                onClick={onLogOut}
                style={{
                  color: "white",
                  background: themeObj.editTrayBackground,
                  cursor: "pointer",
                }}
              >
                Log out
              </li>
            )}
            <li
              style={{ background: themeObj.editTrayBackground }}
              onClick={() => setIsHamburgerMenuShown(false)}
            >
              <a href="/#features" style={{ color: "white" }}>
                Features
              </a>
            </li>
            <li
              style={{ background: themeObj.editTrayBackground }}
              onClick={() => setIsHamburgerMenuShown(false)}
            >
              <a href="/#examples" style={{ color: "white" }}>
                Examples
              </a>
            </li>
            <li
              style={{ background: themeObj.editTrayBackground }}
              onClick={() => setIsHamburgerMenuShown(false)}
            >
              <a href="/#faqs" style={{ color: "white" }}>
                FAQ's
              </a>
            </li>
            <li
              style={{
                color: "white",
                background: themeObj.editTrayBackground,
              }}
              onClick={() => routeTo("/pricing")}
            >
              Pricing
            </li>
            <li
              className={styles.feedback}
              onClick={() => routeTo("/feedback")}
            >
              Provide feedback (please!)
            </li>
            <li
              style={{
                color: "white",
                background: themeObj.editTrayBackground,
              }}
              onClick={() => routeTo("/privacy-policy")}
            >
              Privacy Policy
            </li>
            <li
              style={{
                color: "white",
                background: themeObj.editTrayBackground,
              }}
              onClick={() => routeTo("/terms-and-conditions")}
            >
              Terms and Conditions
            </li>
          </ul>
        </>
      ) : null}
    </div>
  );
};

export default Header;
