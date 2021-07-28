import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './singleSite.css';

const EDIT_TYPE = {
    ALL: "all",
    TITLES: "titles",
    IMAGES: "images",
    LINKS: "links"
}

const SingleSite = () => {
    const { site, fetchSite } = useContext(SitesContext);
    const match = useRouteMatch();
    const [editedSite, setEditedSite] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [whatIsBeingEdited, setWhatIsBeingEdited] = useState(EDIT_TYPE.ALL)

    useEffect(() => {
        fetchSite(match.params.id)
    }, [])

    useEffect(() => {
        const newSite = Object.assign({}, site);
        delete newSite._id;
        setEditedSite(newSite);
    }, [site])

    const onLinkClick = (linkHref) => {
        if (isEditing) {
            setWhatIsBeingEdited(EDIT_TYPE.LINKS);
        } else {
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
    }

    const onSave = () => {
        setIsEditing(false);
    }

    const onCancel = () => {
        setIsEditing(false);
        fetchSite(match.params.id);
    }

    const getEditContents = () => {
        switch (whatIsBeingEdited) {
            case "titles":
                return <div>Titles</div>
            case "images":
                return <div>Images</div>
            case "links":
                return <div>Links</div>
            default: // default and ALL
                return <div>All</div>
        }
    }

    return (
        <>
            {isEditing ? 
                <div className="edit-tray">
                    { getEditContents() }
                </div>
                :
                null
            }
            <div className="single-site-container">
                <div className="edit-and-save-buttons">
                    { isEditing ? 
                        <div className="save-and-cancel-buttons">
                            <FontAwesomeIcon icon={["far", "save"]} size="3x" onClick={onSave} />
                            <FontAwesomeIcon icon={["far", "window-close"]} size="3x" onClick={onCancel} />
                        </div>
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => setIsEditing(true)} />
                    }
                </div>
                <h1 className="single-title" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)}>{site?.title}</h1>
                <p className="single-subtitle" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)}>{site?.subtitle}</p>
                <img 
                    src={site.headerImage || "https://via.placeholder.com/300x300?text=image+here"} 
                    alt={site.title} className="header-image"
                    onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                />
                {site?.links ?
                    <ul className="links-list">
                        {site.links.map((link) => {
                            return <li onClick={() => onLinkClick(link.href)} className="individual-link">
                                <div className="link-text">{link.text} {link?.hits}</div>
                                <FontAwesomeIcon icon={["fab", "github"]} />
                            </li>
                        })}
                    </ul>
                : null}
            </div>
        </>
    )
}

export default SingleSite;