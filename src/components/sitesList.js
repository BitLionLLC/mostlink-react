import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { Link } from 'react-router-dom';
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
                                <img src={site.screenshot || "https://via.placeholder.com/375x280?text=screenshot+here"} width="375" height="280" className="site-screenshot"></img>
                            </li>
                        </Link>
                    })}
                </ul>
            :
                <div className="empty-sites-container">
                    <div className="empty-sites" style={{backgroundColor: themeObj.landingCardBackground}}>
                        <h1>Create a site with the
                            <div className="create-site-clone" style={{color: themeObj.accentColor, backgroundColor: themeObj.bodyColor}}>+</div> 
                            button to get started!
                        </h1>
                    </div>
                </div>
            }
        </div>
    )
}

export default SitesList;