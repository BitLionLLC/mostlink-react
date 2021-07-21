import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import './sitesList.css';

const SitesList = () => {
    const { sites, updateSites } = useContext(SitesContext);

    useEffect(() => {
        updateSites();
    }, [])

    return (
        <ul className="sites-list">
            {sites && sites.map(site => {
                return <a href={`/site/${site._id}`} className="site-link">
                    <li key={site._id} className="site-box">
                        <h2 className="title">{site.title}</h2>
                        <p className="subtitle">{site.subtitle || "subtitle"}</p>
                        <img src={site.screenshot || "https://via.placeholder.com/375x300?text=screenshot+here"} width="375" height="300"></img>
                    </li>
                </a>
            })}
        </ul>
    )
}

export default SitesList;