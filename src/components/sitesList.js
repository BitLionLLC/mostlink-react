import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { Link } from 'react-router-dom';
import CreateSite from './createSite';
import defaultScreenshot from './assets/default-screenshot.png';
import styles from './sitesList.module.css';

const SitesList = () => {
    const { sites, fetchSites, themeObj } = useContext(SitesContext);

    useEffect(() => {
        fetchSites();
    }, [])

    return (
        <div className={styles.sitesContainer}>
            {sites.length ? 
                <ul className={styles.sitesList}>
                    {sites.map((site, i) => {
                        return <Link to={`/site/${site._id}`} className={styles.siteLink} key={site._id}>
                            <li key={site._id} className={styles.siteBox} style={{backgroundColor: themeObj.sitesBoxColor}}>
                                <h2 className={styles.title} style={{ color: themeObj.color }}>{site.title}</h2>
                                <p className={styles.subtitle} style={{ color: themeObj.color }}>{site.subtitle || "subtitle"}</p>
                                <img src={site.screenshot || defaultScreenshot} width="375" height="280" className={styles.siteScreenshot} alt="screenshot for this site"></img>
                            </li>
                        </Link>
                    })}
                </ul>
            :
                <div className={styles.emptySitesContainer}>
                    <div className={styles.emptySites} style={{backgroundColor: themeObj.landingCardBackground}}>
                        <div className={styles.titleAndCreate}>
                            <h1>Create a site with the</h1><CreateSite className={styles.createSiteClone} />
                        </div>
                        <h1 className={styles.justTitle}>button to get started!</h1>
                    </div>
                </div>
            }
        </div>
    )
}

export default SitesList;