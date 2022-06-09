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
        titlesColor,
        containerColor,
        linkTextColor,
        linkBackgroundColor,
        containerGradient,
    } = site

    return (
        <div className={styles.miniSiteWrapper} style={{backgroundColor: containerColor, backgroundImage: containerGradient}}>
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
                        <div>
                            <span style={{color: linkTextColor}} className={styles.linkText}>{link.text}</span>
                            {link.live && <span className={styles.liveNotification} style={{color: linkTextColor}}> - not live</span>}
                        </div>   
                        <FontAwesomeIcon icon={link?.icon?.split("_")} style={{color: linkTextColor}} />
                    </li>
                })}
            </ul>
        </div>
    )
}

export default MiniSite;