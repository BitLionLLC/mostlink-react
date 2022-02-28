import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { SitesContext } from '../contexts/sitesContext';
import './header.css';

const Header = () => {
    const history = useHistory();
    const { jwtToken, setJwtToken, setUserId } = useContext(SitesContext);
    const [isMenuShown, setIsMenuShown] = useState(false);

    const onLogOut = () => {
        setJwtToken(null);
        setUserId(null);

        history.push("/");
    }

    return (
        <div className="header">
            <h1><Link to={jwtToken ? "/home" : "/"}>Mostcard</Link></h1>
            <div className="account-icon" onClick={() => setIsMenuShown(!isMenuShown)}>
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