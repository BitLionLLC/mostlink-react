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
  }, [theme]);

  return (
    <div className={styles.landingContainer}>
      <div className={styles.titlesContainer}>
        <div className={styles.heroTitle}>
          <h1>A modern<br />link in bio</h1>
        </div>

        <div className={styles.landingInner}>
          <div className={styles.landingBelow}>
            <img src={waterGif} alt="flowing water" />
          </div>
          <div className={styles.landingAbove} style={{ backgroundColor: themeObj.landingCardBackground }}>
            <Link to="/account/register" style={{ color: themeObj.color }}><FontAwesomeIcon icon={['fas', 'plus-square']} size="3x" /></Link>
            <h1><Link to="/account/register" style={{ color: themeObj.color }}>Register to start creating custom link pages.</Link></h1>
          </div>
        </div>
      </div>

      <div className={styles.productDetailsContainer}>
        <Features />
        <Examples />
        <FAQs />
        <iframe src="https://cdn.forms-content.sg-form.com/a3165ac8-03da-11ed-90c9-7edf428d4714" title="newsletter-signup" className={styles.newsletterSignup} />
      </div>
    </div>
  );
};

export default Landing;