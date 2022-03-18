import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SitesContext } from '../contexts/sitesContext';
import waterMovie from '../components/assets/water.m4v';

import './landing.css';

const Landing = () => {
    const { themeObj, theme } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    return (
        <div className="landing-container">
            <div className="landing-behind">
                <video autoPlay muted loop id="myVideo" width="500" height="500">
                    <source src={waterMovie} type="video/mp4" />
                </video>
            </div>
             <div className="landing" style={{ backgroundColor: themeObj.landingCardBackground }}>
                <Link to="/account/login" style={{ color: themeObj.color }}><FontAwesomeIcon icon={["fas", "plus-square"]} size="3x"/></Link>
                <h1><Link to="/account/login" style={{ color: themeObj.color }}>Log in to start creating custom link pages.</Link></h1>
            </div>
        </div>
    )
}

export default Landing;