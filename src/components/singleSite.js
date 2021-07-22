import React, { useContext, useEffect } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';

const SingleSite = () => {
    const { sites, updateSites } = useContext(SitesContext);
    const match = useRouteMatch();

    useEffect(() => {
        updateSites()
    }, [])
    
    const thisSite = sites.filter((site) => site._id === match.params.id)[0]

    return (
        <div>
            <h1>{thisSite?.title}</h1>
            <p>{thisSite?.subtitle}</p>
        </div>
    )
}

export default SingleSite;