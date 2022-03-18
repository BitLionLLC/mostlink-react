import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SitesContext } from '../contexts/sitesContext';

import './header.css';

const Header = () => {
    const history = useHistory();
    const { jwtToken, setJwtToken, setUserId } = useContext(SitesContext);
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
    
    const toggleMenu = e => {
        e.stopPropagation();
        setIsMenuShown(!isMenuShown);
    }

    return (
        <div className="header">
            <h1><Link to={jwtToken ? "/home" : "/"}>Mostcard</Link></h1>
            <div className="account-icon" onClick={e => toggleMenu(e)}>
                <FontAwesomeIcon icon={jwtToken ? ["fas", "user-check"] : ["fas", "user"]}/>
            </div>
            <div style={{ display: isMenuShown ? "block" : "none"}} className="account-menu">
                <div className="attach-triangle"></div>
                <ul className="account-menu-list">
                    {jwtToken && <li><Link to="/account">Account</Link></li>}
                    {!jwtToken && <li><Link to="/account/register">Register</Link></li>}
                    {!jwtToken && <li><Link to="/account/login">Log in</Link></li>}
                    {jwtToken && <li onClick={onLogOut}>Log out</li>}
                </ul>   
            </div>
        </div>
    )
}

export default Header;