import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { Link } from 'react-router-dom';
import CreateSite from './createSite';
import styles from './sitesList.module.css';
import MiniSite from './miniSite';

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
                                <MiniSite site={site} />
                            </li>
                        </Link>
                    })}
                </ul>
            :
                <div className={styles.emptySitesContainer}>
                    <div className={styles.emptySites} style={{backgroundColor: themeObj.landingCardBackground}}>
                        <div className={styles.titleAndCreate}>
                            <h1>Create a site with the</h1><CreateSite className="createSiteClone" />
                        </div>
                        <h1 className={styles.justTitle}>button to get started!</h1>
                    </div>
                </div>
            }
        </div>
    )
}

export default SitesList;