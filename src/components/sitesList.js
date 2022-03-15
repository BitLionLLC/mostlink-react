import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { Link } from 'react-router-dom';
import './sitesList.css';

const SitesList = () => {
    const { sites, fetchSites } = useContext(SitesContext);

    useEffect(() => {
        fetchSites();
    }, [])

    return (
        <ul className="sites-list">
            {sites.length ? sites.map((site, i) => {
                return <Link to={`/site/${site._id}`} className="site-link">
                    <li key={site._id} className="site-box" style={{backgroundColor: `rgba(0,${20*i+100},0)`}}>
                        <h2 className="title">{site.title}</h2>
                        <p className="subtitle">{site.subtitle || "subtitle"}</p>
                        <img src={site.screenshot || "https://via.placeholder.com/375x300?text=screenshot+here"} width="375" height="300"></img>
                    </li>
                </Link>
            })
            :
            <div>Create a site with the + button to get started!</div>
            }
        </ul>
    )
}

export default SitesList;