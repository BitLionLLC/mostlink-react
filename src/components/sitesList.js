import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';

const SitesList = () => {
    const { sites, updateSites } = useContext(SitesContext);

    useEffect(() => {
        updateSites();
    }, [])

    return (
        <ul>
            {sites && sites.map(site => {
                return <li key={site._id}>{site._id} {site.title}</li>
            })}
        </ul>
    )
}

export default SitesList;