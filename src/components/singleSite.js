import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './singleSite.css';

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
        <div className="single-site-container">
            <div className="edit-and-save-button"></div>
            <h1 className="single-title">{site?.title}</h1>
            <p className="single-subtitle">{site?.subtitle}</p>
            <img src={site.headerImage || "https://via.placeholder.com/300x300?text=image+here"} alt={site.title} className="header-image" />
            {site?.links ?
                <ul className="links-list">
                    {site.links.map((link) => {
                        return <li onClick={() => onLinkClick(link.href)} className="individual-link">
                            <div>{link.text} {link?.hits}</div>
                            <FontAwesomeIcon icon={["fab", "github"]} />
                        </li>
                    })}
                </ul>
            : null}
        </div>
    )
}

export default SingleSite;