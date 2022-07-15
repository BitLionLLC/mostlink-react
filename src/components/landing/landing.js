import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SitesContext } from '../../contexts/sitesContext';
import Features from './features';
import Examples from './examples';
import FAQs from './faqs';
import waterGif from '../../components/assets/water.gif';

import styles from './landing.module.css';

const Landing = () => {
    const { themeObj, theme } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    return (
        <div className={styles.landingContainer}>
            <div className={styles.titlesContainer}>
                <h1>A modern link page builder for content creators and business owners</h1>
                <h2>Build your own custom site today with our easy-to-use builder. Start for free!</h2>
            </div>

            <div className={styles.landingInner}>
                <div className={styles.landingBehind}>
                    <img src={waterGif} alt="flowing water" />
                </div>
                <div className={styles.landing} style={{ backgroundColor: themeObj.landingCardBackground }}>
                    <Link to="/account/login" style={{ color: themeObj.color }}><FontAwesomeIcon icon={["fas", "plus-square"]} size="3x"/></Link>
                    <h1><Link to="/account/login" style={{ color: themeObj.color }}>Log in to start creating custom link pages.</Link></h1>
                </div>
            </div>

            <div className={styles.productDetailsContainer}>
                <Features />
                <Examples />
                <FAQs />
                <iframe src="https://cdn.forms-content.sg-form.com/a3165ac8-03da-11ed-90c9-7edf428d4714" title="newsletter-signup" className={styles.newsletterSignup}/>
            </div>
        </div>
    )
}

export default Landing;