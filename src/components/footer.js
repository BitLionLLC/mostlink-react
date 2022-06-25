import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SitesContext } from '../contexts/sitesContext';

import styles from './footer.module.css';

const Footer = () => {
    const { themeObj, theme } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    return (
        <div className={styles.footer} style={{background: themeObj.headerColor}}>
            <div style={{color: themeObj.color}}>Copyright 2021-{new Date().getFullYear()}, BitLion, LLC</div>
            <div><Link to="/privacy-policy" style={{color: themeObj.color}}>Privacy Policy</Link></div>
        </div>
    )
}

export default Footer;