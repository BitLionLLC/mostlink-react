import axios from 'axios';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useRouteMatch } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import Select, { components } from "react-select";
import FileBase64 from 'react-file-base64';
import { HexColorPicker } from "react-colorful";
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
    const [isEditing, setIsEditing] = useState(false);
    const [whatIsBeingEdited, setWhatIsBeingEdited] = useState(EDIT_TYPE.ALL);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [headerImage, setHeaderImage] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");
    const [links, setLinks] = useState([]);
    const [titlesColor, setTitlesColor] = useState("#000000");
    const [containerColor, setContainerColor] = useState("#ADD8E6");
    const [linkTextColor, setLinkTextColor] = useState("#000000");
    const [linkBackgroundColor, setLinkBackgroundColor] = useState("#FFFFFF");

    useEffect(() => {
        fetchSite(match.params.id)
    }, [])

    useEffect(() => {
        setTitle(site.title);
        setSubtitle(site.subtitle);
        setHeaderImage(site.headerImage);
        setLinks(site.links);
        setBackgroundImage(site.backgroundImage);
        setTitlesColor(site.titlesColor);
        setContainerColor(site.containerColor);
        setLinkTextColor(site.linkTextColor);
        setLinkBackgroundColor(site.linkBackgroundColor);
    }, [site])

    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgroundImage?.base64})`;
        console.log(backgroundImage)
    }, [backgroundImage])

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
        const siteToSave = {
            title,
            subtitle,
            headerImage,
            backgroundImage,
            links,
            titlesColor,
            containerColor,
            linkTextColor,
            linkBackgroundColor
        }

        axios
            .put(`http://localhost:4000/sites/${match.params.id}`, siteToSave)
            .then(() => {
                setIsEditing(false);
                fetchSite(match.params.id);
                setWhatIsBeingEdited(EDIT_TYPE.ALL);
            })
            .catch((e) => {
                console.error("Error saving site: " + e);
            })
    }

    const onCancel = () => {
        setIsEditing(false);
        fetchSite(match.params.id);
        setWhatIsBeingEdited(EDIT_TYPE.ALL);
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

    const selectOptions = Object.keys(fab).concat(Object.keys(far)).filter((key) => key !== "faFontAwesomeLogoFull").sort().map(key => {
        let lib;
        if (Object.keys(far).includes(key)) {
            lib = "far"
        } else {
            lib = "fab"
        }
        const [label, value] = transformIconKey(key, lib);
        return {value, label}
    })

    const { Option } = components;
    const IconOption = props => (
        <Option {...props} className="icon-option">
            {props.data.label}
            <FontAwesomeIcon icon={props.data.value.split("_")} size="2x" className="icon-option-icon" />
        </Option>
    );

    const addLink = () => {
        const newLinks = links.slice();
        newLinks.push({
            href: "https://www.google.com",
            text: "Google",
            icon: "fab_google"
        });
        setLinks(newLinks);
    }

    const deleteLink = index => {
        const newLinks = links.slice();
        newLinks.splice(index, 1);
        setLinks(newLinks);
    }

    const getEditContents = () => {
        switch (whatIsBeingEdited) {
            case "titles":
                return <div className="edit-contents">
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className="back-arrow" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h2>Title</h2>
                    <input type="text" value={title} placeholder="Title" onChange={e => setTitle(e.target.value)} />
                    <h2>Subtitle</h2>
                    <input type="text" value={subtitle} placeholder="Subtitle" onChange={e => setSubtitle(e.target.value)} />
                    <h3>Title Color</h3>
                    <HexColorPicker color={titlesColor} onChange={setTitlesColor} />
                </div>
            case "images":
                return <div className="edit-contents">
                        <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className="back-arrow" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                        <h2>Header Image</h2>
                        <img src={headerImage.base64} width="300" height="300" />
                        <FileBase64 multiple={false} onDone={(file) => setHeaderImage(file)} />
                        <h2>Background Image</h2>
                        <img src={backgroundImage.base64} width="300" height="300" />
                        <FileBase64 multiple={false} onDone={(file) => setBackgroundImage(file)} />
                    </div>
            case "links":
                return <div className="edit-contents">
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className="back-arrow" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h2>Links</h2>
                    <h3>Link Text Color</h3>
                    <HexColorPicker color={linkTextColor} onChange={setLinkTextColor} />
                    <h3>Link Background Color</h3>
                    <HexColorPicker color={linkBackgroundColor} onChange={setLinkBackgroundColor} />
                    <ul className="link-edit-list">
                        {links.map((link, index) => {
                            return <li className="link-edit-li">
                                
                                <input type="text" value={links[index].text} placeholder={`Link #${index + 1}`} onChange={e => {
                                    const newLinks = links.slice();
                                    newLinks[index].text = e.target.value;
                                    setLinks(newLinks);
                                }} />
                                <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => deleteLink(index)} color="red" />
                                <Select 
                                    onChange={e => {
                                        const newLinks = links.slice();
                                        newLinks[index].icon = e.value;
                                        setLinks(newLinks);
                                    }} 
                                    defaultValue={selectOptions[selectOptions.indexOf(selectOptions.find(obj => obj.value === link?.icon))]} 
                                    options={selectOptions} 
                                    components={{ Option: IconOption }} 
                                />
                            </li>
                        })}
                    </ul>
                    <button onClick={addLink}>+</button>
                </div>
            default: // default and ALL
                return <div className="edit-contents">
                    <h2>General Settings</h2>
                    <h3>Container Color</h3>
                    <HexColorPicker color={containerColor} onChange={setContainerColor} />
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)}>Title Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}>Image Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.LINKS)}>Link Settings</button>
                </div>
        }
    }

    const getDisplayContents = (thisTitle, thisSubtitle, thisHeaderImage, theseLinks, titlesColor, containerColor, linkTextColor, linkBackgroundColor) => {
        return <div className="single-site-container" style={{ backgroundColor: containerColor }}>
                <div className="edit-button">
                    { isEditing ? 
                        null
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => setIsEditing(true)} />
                    }
                </div>
                <h1 className="single-title" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisTitle}</h1>
                <p className="single-subtitle" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisSubtitle}</p>
                <img 
                    src={thisHeaderImage || "https://via.placeholder.com/300x300?text=image+here"} 
                    alt={title} className="header-image"
                    onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                    width="300" height="300"
                />
                {links ?
                    <ul className="links-list">
                        {theseLinks?.map((link) => {
                            return <li onClick={() => onLinkClick(link.href)} className="individual-link" style={{ color: linkTextColor, backgroundColor: linkBackgroundColor }}>
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
                getDisplayContents(title, subtitle, headerImage?.base64, links, titlesColor, containerColor, linkTextColor, linkBackgroundColor)
                :
                getDisplayContents(site.title, site.subtitle, site.headerImage?.base64, site.links, site.titlesColor, site.containerColor, site.linkTextColor, site.linkBackgroundColor)
            }
        </>
    )
}

export default SingleSite;