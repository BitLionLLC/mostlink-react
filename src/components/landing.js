import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SitesContext } from '../contexts/sitesContext';

import './landing.css';

const Landing = () => {
    const { themeObj, theme } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    return (
        <div className="landing-container">
            <div className="landing-behind"></div>
             <div className="landing" style={{ backgroundColor: themeObj.landingCardBackground }}>
                <Link to="/account/login" style={{ color: themeObj.color }}><FontAwesomeIcon icon={["fas", "plus-square"]} size="3x"/></Link>
                <h1><Link to="/account/login" style={{ color: themeObj.color }}>Log in to start creating.</Link></h1>
            </div>
        </div>
    )
}

export default Landing;