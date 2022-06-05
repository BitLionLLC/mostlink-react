import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SitesContext } from '../contexts/sitesContext';
import { useGoogleLogout } from 'react-google-login'
import lightLogo from './assets/logo-light.png';
import darkLogo from './assets/logo-dark.png';

import styles from './header.module.css';

const Header = () => {
    const history = useHistory();
    const { jwtToken, setJwtToken, setUserId, theme, themeObj, toggleTheme } = useContext(SitesContext);
    const [isMenuShown, setIsMenuShown] = useState(false);
    let jwtTokenRef = useRef(jwtToken);

    const { signOut } = useGoogleLogout({
        jsSrc: "https://apis.google.com/js/api.js",
        onFailure: (err) => toast(err, { type: "error"}),
        clientId: "481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com",
        redirectUri: "/",
        onLogoutSuccess: () => {}
    })

    const onLogOut = () => {
        signOut();
        axios
            .get(`/api/users/logout`)
            .then(() => {
                toast("Successfully logged out.", { type: "success"})
            })

        setJwtToken(null);
        setUserId(null);
        localStorage.removeItem("mostlinkUserId");

        history.push("/");
    }

    useEffect(() => {
        document.body.addEventListener('click', () => setIsMenuShown(false));

        return document.body.removeEventListener('click', () => setIsMenuShown(false));
    }, [])

    useEffect(() => {
        if (!(history.location.pathname.includes('site'))) {
            document.body.style.backgroundColor = themeObj.bodyColor;
        }
    })

    useEffect(() => {
        jwtTokenRef.current = jwtToken
    }, [jwtToken])

    useEffect(() => {
        document.body.style.backgroundColor = themeObj.bodyColor;
        document.body.style.color = themeObj.color;
    }, [theme])

    useEffect(() => {
        axios
            .get(`/api/users/jwt`)
            .then(res => {
                if (res.data.token) {
                    setJwtToken(res.data.token);
                
                    if (history.location.pathname === "/") {
                        history.push("/home");
                    }
                }
            })
            .catch(() => {
                toast("Please log in.", { type: "error"});
                history.push("/");
            })

        const userId = localStorage.getItem("mostlinkUserId")
        setUserId(userId);
    }, [])

    useEffect(() => {
        const allowedPathsWhenLoggedOut = ["/account/login", "/account/register", "/account/reset-password", "/account/forgot-password", '/pricing'];
        
        setTimeout(() => {
            if (!jwtTokenRef.current) {
                const matches = allowedPathsWhenLoggedOut.filter(path => history.location.pathname.startsWith(path));
                
                if (!matches.length) {
                    history.push("/");
                }
            }
        }, 500)
    }, [jwtToken])
    
    const toggleMenu = e => {
        e.stopPropagation();
        setIsMenuShown(!isMenuShown);
    }

    return (
        <div className={styles.header} style={{ backgroundColor: themeObj.headerColor, color: themeObj.color }}>
            <div className={styles.logoAndTitle}>
                <Link to={jwtToken ? "/home" : "/"} style={{ color: themeObj.color }}>
                    <img src={theme === "light" ? lightLogo : darkLogo} width="100" alt="Mostlink logo" />
                    <h1>Mostlink</h1>
                </Link>
            </div>
            <div className={styles.iconRow}>
                <Link to="/pricing" className={styles.pricingLink} style={{ color: themeObj.color }}>Pricing</Link>
                <div className={styles.accountIcon} onClick={e => toggleMenu(e)} style={{ right: jwtToken ? "15px" : "18px", color: jwtToken && themeObj.loggedInColor }}>
                    <FontAwesomeIcon icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}/>
                </div>
                <div className={styles.themeIcon} onClick={toggleTheme}>
                    <FontAwesomeIcon icon={theme === "dark" ? ["fas", "sun"] : ["fas", "moon"]}/>
                </div>
            </div>
            <div style={{ display: isMenuShown ? "block" : "none", backgroundColor: themeObj.menuColor }} className={styles.accountMenu}>
                <div className={styles.attachTriangle} style={{ backgroundColor: themeObj.menuColor }}></div>
                <ul className={styles.accountMenuList} >
                    {jwtToken && <li><Link to="/account" style={{ color: themeObj.color }}>Account</Link></li>}
                    {!jwtToken && <li><Link to="/account/register" style={{ color: themeObj.color }}>Register</Link></li>}
                    {!jwtToken && <li><Link to="/account/login" style={{ color: themeObj.color }}>Log in</Link></li>}
                    {jwtToken && <li onClick={onLogOut} style={{ color: themeObj.color, cursor: "pointer" }}>Log out</li>}
                </ul>   
            </div>
        </div>
    )
}

export default Header;