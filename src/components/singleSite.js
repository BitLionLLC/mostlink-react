import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';

const SingleSite = () => {
    const { site, updateSite } = useContext(SitesContext);
    const match = useRouteMatch();

    useEffect(() => {
        updateSite(match.params.id);
    }, [])

    const onLinkClick = (linkHref) => {
        const newSite = Object.assign({}, site);
        delete newSite._id;
        const links = newSite.links.slice();
        const linkInQuestion = links.filter((link) => {
            return linkHref === link.href;
        })[0]
        const indexOfLink = links.indexOf(linkInQuestion);
        linkInQuestion.hits = linkInQuestion.hits ? Number(linkInQuestion?.hits) + 1 : 1;
        links[indexOfLink] = linkInQuestion;
        newSite.links = links;

        axios
            .put(`http://localhost:4000/sites/${match.params.id}`, newSite)
            .then(() => {
                window.location.assign(linkHref);
            })
            .catch(err => console.error(err))
    }

    return (
        <div>
            <h1>{site?.title}</h1>
            <p>{site?.subtitle}</p>
            {site?.links ?
                <ul>
                    {site.links.map((link) => {
                        return <li onClick={() => onLinkClick(link.href)}>{link.text} {link?.hits}</li>
                    })}
                </ul>
            : null}
        </div>
    )
}

export default SingleSite;