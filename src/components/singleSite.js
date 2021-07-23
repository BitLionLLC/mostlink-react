import React, { useContext, useEffect } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';

const SingleSite = () => {
    const { site, updateSite } = useContext(SitesContext);
    const match = useRouteMatch();

    useEffect(() => {
        updateSite(match.params.id);
    }, [])

    return (
        <div>
            <h1>{site?.title}</h1>
            <p>{site?.subtitle}</p>
            {site?.links ?
                <ul>
                    {site.links.map((link) => {
                        return <a href={link.href}><li>{link.text}</li></a>
                    })}
                </ul>
            : null}
        </div>
    )
}

export default SingleSite;