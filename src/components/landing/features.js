import React, { useContext } from 'react';
import { SitesContext } from '../../contexts/sitesContext';
import FEATURES from '../../constants/features';
import animatedGifs from '../assets/features/animated-gifs.gif';
import backgroundAnimations from '../assets/features/background-animations.gif';
import backgroundImages from '../assets/features/background-images.png';
import gradients from '../assets/features/gradients.png';
import linkHoverEffect from '../assets/features/link-hover-effect.gif';
import liveNotifications from '../assets/features/live-notifications.png';

import styles from './features.module.css';

const imageSources = {
  'animated-gifs.gif': animatedGifs,
  'background-animations.gif': backgroundAnimations,
  'background-images.png': backgroundImages,
  'gradients.png': gradients,
  'link-hover-effect.gif': linkHoverEffect,
  'live-notifications.png': liveNotifications
}

const Features = () => {
  const { themeObj } = useContext(SitesContext);

  return (
    <div className={styles.features} style={{ backgroundColor: themeObj.landingCardBackground }}>
      <h1>Features</h1>
      <ul className={styles.featureList}>
        {FEATURES.map(feature => {
          return <li key={feature.name} className={styles.feature}>
            <h3>{feature.name}</h3>
            <div className={styles.description}>{feature.description}</div>
            <img src={imageSources[feature.image]} alt={feature.name} />
          </li>
        })}
      </ul>   
    </div>
  )
}

export default Features;