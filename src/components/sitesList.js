import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { Link } from 'react-router-dom';
import CreateSite from './createSite';
import defaultScreenshot from './assets/default-screenshot.png';
import './sitesList.css';

const SitesList = () => {
    const { sites, fetchSites, themeObj } = useContext(SitesContext);

    useEffect(() => {
        fetchSites();
    }, [])

    return (
        <div className="sites-container">
            {sites.length ? 
                <ul className="sites-list">
                    {sites.map((site, i) => {
                        return <Link to={`/site/${site._id}`} className="site-link">
                            <li key={site._id} className="site-box" style={{backgroundColor: `rgba(0,${20*i+100},0)`}}>
                                <h2 className="title" style={{ color: themeObj.color }}>{site.title}</h2>
                                <p className="subtitle" style={{ color: themeObj.color }}>{site.subtitle || "subtitle"}</p>
                                <img src={site.screenshot || defaultScreenshot} width="375" height="280" className="site-screenshot" alt="screenshot for this site"></img>
                            </li>
                        </Link>
                    })}
                </ul>
            :
                <div className="empty-sites-container">
                    <div className="empty-sites" style={{backgroundColor: themeObj.landingCardBackground}}>
                        <div className="title-and-create">
                            <h1>Create a site with the</h1><CreateSite className="create-site-clone" />
                        </div>
                        <h1 className="just-title">button to get started!</h1>
                    </div>
                </div>
            }
        </div>
    )
}

export default SitesList;