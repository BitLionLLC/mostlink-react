import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './singleSite.css';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';

const EDIT_TYPE = {
    ALL: "all",
    TITLES: "titles",
    IMAGES: "images",
    LINKS: "links"
}

const SingleSite = () => {
    const { site, fetchSite } = useContext(SitesContext);
    const match = useRouteMatch();
    const [isEditing, setIsEditing] = useState(false);
    const [whatIsBeingEdited, setWhatIsBeingEdited] = useState(EDIT_TYPE.ALL);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [headerImage, setHeaderImage] = useState("");
    const [links, setLinks] = useState([]);

    useEffect(() => {
        fetchSite(match.params.id)
    }, [])

    useEffect(() => {
        setTitle(site.title);
        setSubtitle(site.subtitle);
        setHeaderImage(site.headerImage);
        setLinks(site.links);
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

        const siteToSave = {
            title,
            subtitle,
            headerImage,
            links
        }

        axios
            .put(`http://localhost:4000/sites/${match.params.id}`, siteToSave)
            .then(() => {
                toast("Success", {type: "success"});
            })
            .catch(() => {
                toast('Error saving site.', {type: "error"});
            })
    }

    const onCancel = () => {
        setIsEditing(false);
        fetchSite(match.params.id);
    }

    const transformIconKey = (key, lib) => {
        const arr = key.split("").slice(2);
        const display = arr.join("");
        let valueArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].toUpperCase() === arr[i] && !Number.isInteger(Number(arr[i])) && i !== 0) {
                valueArr.push("-");
                valueArr.push(arr[i].toLowerCase());
            } else if (arr[i].toUpperCase() === arr[i] && !Number.isInteger(Number(arr[i]))) {
                valueArr.push(arr[i].toLowerCase());
            } else {
                valueArr.push(arr[i]);
            }
        }

        const value = lib + "_" + valueArr.join("");
        return [display, value];
    }

    const getEditContents = () => {
        switch (whatIsBeingEdited) {
            case "titles":
                return <div className="edit-contents">
                    <h2>Title</h2>
                    <input type="text" value={title} placeholder="Title" onChange={e => setTitle(e.target.value)} />
                    <h2>Subtitle</h2>
                    <input type="text" value={subtitle} placeholder="Subtitle" onChange={e => setSubtitle(e.target.value)} />
                </div>
            case "images":
                return <div className="edit-contents">Images</div>
            case "links":
                return <div className="edit-contents">
                    <h2>Links</h2>
                    <ul>
                        {links.map((link, index) => {
                            return <>
                                <input type="text" value={links[index].text} placeholder={`Link #${index + 1}`} onChange={e => {
                                    const newLinks = links.slice();
                                    newLinks[index].text = e.target.value;
                                    setLinks(newLinks);
                                }} />
                                <select onChange={e => {
                                    const newLinks = links.slice();
                                    newLinks[index].icon = e.target.value;
                                    setLinks(newLinks);
                                }} value={link?.icon}>
                                    {Object.keys(fab).concat(Object.keys(far)).sort().map(key => {
                                        let lib;
                                        if (Object.keys(far).includes(key)) {
                                            lib = "far"
                                        } else {
                                            lib = "fab"
                                        }
                                        const [display, value] = transformIconKey(key, lib);
                                        return <option value={value}>{display}</option>
                                    })}
                                </select>
                            </>
                        })}
                    </ul>
                </div>
            default: // default and ALL
                return <div className="edit-contents">All</div>
        }
    }

    const getDisplayContents = (title, subtitle, headerImage, links) => {
        return <div className="single-site-container">
                <div className="edit-button">
                    { isEditing ? 
                        null
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => setIsEditing(true)} />
                    }
                </div>
                <h1 className="single-title" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)}>{title}</h1>
                <p className="single-subtitle" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)}>{subtitle}</p>
                <img 
                    src={headerImage || "https://via.placeholder.com/300x300?text=image+here"} 
                    alt={title} className="header-image"
                    onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                />
                {links ?
                    <ul className="links-list">
                        {links.map((link) => {
                            return <li onClick={() => onLinkClick(link.href)} className="individual-link">
                                <div className="link-text">{link.text}</div>
                                <FontAwesomeIcon icon={link?.icon?.split("_")} size="2x" />
                            </li>
                        })}
                    </ul>
                : null}
            </div>
    }

    return (
        <>
            { isEditing ? 
                <div className="edit-tray">
                    <div className="save-and-cancel-buttons">
                        <FontAwesomeIcon icon={["far", "save"]} size="3x" onClick={onSave} color="lightgreen" />
                        <FontAwesomeIcon icon={["far", "window-close"]} size="3x" onClick={onCancel} color="red" />
                    </div>
                    { getEditContents() }
                </div>
                :
                null
            }
            { isEditing ?
                getDisplayContents(title, subtitle, headerImage, links)
                :
                getDisplayContents(site.title, site.subtitle, site.headerImage, site.links)
            }
        </>
    )
}

export default SingleSite;