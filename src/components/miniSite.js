import React, { useContext } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultHeader from './assets/default-header.png';

import styles from './miniSite.module.css';

const MiniSite = ({site}) => {
  const { setIsEditModalOpen, setEditModalOpenedWith } = useContext(SitesContext);

  const {
    title,
    subtitle,
    headerImage,
    headerEmoji,
    links,
    titlesColor,
    containerColor,
    linkTextColor,
    linkBackgroundColor,
    containerGradient,
    liveNotificationColor,
    subdomain,
    _id
  } = site;

  return (
    <div className={styles.miniSiteWrapper} style={{backgroundColor: containerColor, backgroundImage: containerGradient}}>
      <FontAwesomeIcon icon={['far', 'edit']} size="3x" className={styles.editButton} onClick={(e) => {
        e.preventDefault();
        setIsEditModalOpen(true);
        setEditModalOpenedWith({ title, subtitle, subdomain, id: _id });
      }} />
      {
        headerEmoji 
          ?
          <span className={styles.headerEmoji}>{headerEmoji}</span>
          :
          <img src={headerImage?.url || headerImage?.base64 || defaultHeader} alt='header' width="75" height="75" className={styles.headerImage} />
      }
      <span className={styles.title} style={{color: titlesColor}}>{title}</span>
      <span className={styles.subtitle} style={{color: titlesColor}}>{subtitle}</span>
      <ul className={styles.linksList}>
        {links.map((link, i) => {
          return <li className={styles.linkRow} key={i} style={{backgroundColor: linkBackgroundColor}}>
            <div className={styles.linkAndLive}>
              <span style={{color: linkTextColor}} className={styles.linkText}>{link.text}&nbsp;</span>
              {link.live ? <div>{link.live.isLive ? <><span>-</span><span style={{color: liveNotificationColor}}> LIVE!</span></> : '- not live'}</div> : null}
            </div>   
            <FontAwesomeIcon icon={link?.icon?.split('_')} style={{color: linkTextColor}} />
          </li>;
        })}
      </ul>
    </div>
  );
};

export default MiniSite;