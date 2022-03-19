import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SitesContext } from '../contexts/sitesContext';
import lightLogo from './assets/logo-light.png';
import darkLogo from './assets/logo-dark.png';

import './header.css';

const Header = () => {
    const history = useHistory();
    const { jwtToken, setJwtToken, setUserId, theme, themeObj, setTheme, toggleTheme } = useContext(SitesContext);
    const [isMenuShown, setIsMenuShown] = useState(false);

    const onLogOut = () => {
        axios
            .get(`/users/logout`)
            .then(() => {
                toast("Successfully logged out.", { type: "success"})
            })

        setJwtToken(null);
        setUserId(null);
        localStorage.removeItem("mostcardUserId");

        history.push("/");
    }

    useEffect(() => {
        document.body.addEventListener('click', () => setIsMenuShown(false));

        return document.body.removeEventListener('click', () => setIsMenuShown(false));
    }, [])

    useEffect(() => {
        document.body.style.backgroundColor = themeObj.bodyColor;
        document.body.style.color = themeObj.color;
    }, [theme])

    useEffect(() => {
        axios
            .get(`/users/jwt`)
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

        const userId = localStorage.getItem("mostcardUserId")
        setUserId(userId);
    }, [])

    useEffect(() => {
        const allowedPathsWhenLoggedOut = ["/", "/account/login", "/account/register"];
        
        if (!jwtToken) {
            if (!(allowedPathsWhenLoggedOut.includes(history.location.pathname))) {
                history.push("/");
            }
        }
    })
    
    const toggleMenu = e => {
        e.stopPropagation();
        setIsMenuShown(!isMenuShown);
    }

    return (
        <div className="header" style={{ backgroundColor: themeObj.headerColor, color: themeObj.color }}>
            <div className="logo-and-title">
                <Link to={jwtToken ? "/home" : "/"} style={{ color: themeObj.color }}>
                    <img src={theme === "light" ? lightLogo : darkLogo} width="100" />
                    <h1>Mostcard</h1>
                </Link>
            </div>
            <div className="icon-row">
                <div className="account-icon" onClick={e => toggleMenu(e)} style={{ right: jwtToken ? "15px" : "18px"}}>
                    <FontAwesomeIcon icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}/>
                </div>
                <div className="theme-icon" onClick={toggleTheme}>
                    <FontAwesomeIcon icon={theme === "dark" ? ["fas", "moon"] : ["fas", "sun"]}/>
                </div>
            </div>
            <div style={{ display: isMenuShown ? "block" : "none", backgroundColor: themeObj.menuColor }} className="account-menu">
                <div className="attach-triangle" style={{ backgroundColor: themeObj.menuColor }}></div>
                <ul className="account-menu-list" >
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