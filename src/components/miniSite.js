import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import defaultHeader from './assets/default-header.png';

import styles from './miniSite.module.css';

const MiniSite = ({site}) => {
    const {
        title,
        subtitle,
        headerImage,
        headerEmoji,
        links,
        backgroundImage,
        titlesColor,
        containerColor,
        bodyColor,
        linkTextColor,
        linkBackgroundColor,
        liveNotificationColor,
        bodyGradient,
        containerGradient,
        bodyAnimationStyle
    } = site

    return (
        <div className={styles.miniSiteWrapper} style={{backgroundColor: containerColor, backgroundImage: containerGradient}}>
            <img src={headerImage?.url || headerImage?.base64 || defaultHeader} alt='header' width="75" height="75" className={styles.headerImage} />
            <span className={styles.title}>{title}</span>
            <span className={styles.subtitle}>{subtitle}</span>
            <ul className={styles.linksList}>
                {links.map((link, i) => {
                    return <li className={styles.linkRow} key={i} style={{backgroundColor: linkBackgroundColor}}>
                        <div>
                            <span style={{color: linkTextColor}} className={styles.linkText}>{link.text}</span>
                            {link.live && <span className={styles.liveNotification}> - not live</span>}
                        </div>   
                        <FontAwesomeIcon icon={link?.icon?.split("_")} />
                    </li>
                })}
            </ul>
        </div>
    )
}

export default MiniSite;