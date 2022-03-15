import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useRouteMatch, Prompt } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import Select, { components as reactSelectComponents } from "react-select";
import FileBase64 from 'react-file-base64';
import { HexColorPicker } from "react-colorful";
import { useBeforeunload } from 'react-beforeunload';
import invert from 'invert-color';
import './singleSite.css';

const EDIT_TYPE = {
    ALL: "all",
    TITLES: "titles",
    IMAGES: "images",
    LINKS: "links"
}

const IMAGE_TYPE = {
    HEADER: "header",
    BACKGROUND: "background"
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
    const [isModalShowing, setIsModalShowing] = useState(false);
    const [modalOpenedWith, setModalOpenedWith] = useState("");
    const [photos, setPhotos] = useState([]);
    const [query, setQuery] = useState("abstract");
    const [isDirty, setIsDirty] = useState(false);

    const fetchPexels = (e) => {
        e?.preventDefault();

        const headers = {
            Authorization: "563492ad6f9170000100000180348db710564c64a1b0dc2f260570b2"
        }

        axios
            .get(`https://api.pexels.com/v1/search?query=${query}&per_page=50`, { headers: headers })
            .then(res => setPhotos(res.data.photos))
            .catch(err => console.error(err))
    }

    useEffect(() => {
        fetchSite(match.params.id);
        fetchPexels();
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
        document.body.style.backgroundImage = `url(${backgroundImage?.base64 || backgroundImage?.url})`;
    }, [backgroundImage])

    useBeforeunload((e) => {
        if (isDirty) {
            e.preventDefault();
        }
    })

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
                .put(`/sites/${match.params.id}`, newSite)
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
            .put(`/sites/siteId/${match.params.id}`, siteToSave)
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

    const { Option } = reactSelectComponents;
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

    const openModal = (component) => {
        setIsModalShowing(true);
        setModalOpenedWith(component);
    }

    const getEditContents = () => {
        switch (whatIsBeingEdited) {
            case "titles":
                return <div className="edit-contents">
                    <h1>Titles</h1>
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className="back-arrow" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h2>Title</h2>
                    <input type="text" value={title} placeholder="Title" onChange={e => setTitle(e.target.value)} />
                    <h2>Subtitle</h2>
                    <input type="text" value={subtitle} placeholder="Subtitle" onChange={e => setSubtitle(e.target.value)} />
                    <h2>Title Color</h2>
                    <HexColorPicker color={titlesColor} onChange={setTitlesColor} />
                </div>
            case "images":
                return <div className="edit-contents">
                        <h1>Images</h1>
                        <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className="back-arrow" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                        <h2>Header Image</h2>
                        <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderImage("")} color="red" />
                        <img src={headerImage?.base64 || headerImage?.url} width="300" height="300" />
                        <FileBase64 multiple={false} onDone={(file) => setHeaderImage(file)} />
                        <button onClick={() => openModal(IMAGE_TYPE.HEADER)}>Choose from Pexels</button>
                        <h2>Background Image</h2>
                        <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setBackgroundImage("")} color="red" />
                        <img src={backgroundImage?.base64 || backgroundImage?.url} width="300" height="300" />
                        <FileBase64 multiple={false} onDone={(file) => setBackgroundImage(file)} />
                        <button onClick={() => openModal(IMAGE_TYPE.BACKGROUND)}>Choose from Pexels</button>
                    </div>
            case "links":
                return <div className="edit-contents">
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className="back-arrow" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h1>Links</h1>
                    <h2>Link Text Color</h2>
                    <HexColorPicker color={linkTextColor} onChange={setLinkTextColor} />
                    <h2>Link Background Color</h2>
                    <HexColorPicker color={linkBackgroundColor} onChange={setLinkBackgroundColor} />
                    <h2>Links</h2>
                    <ul className="link-edit-list">
                        {links.map((link, index) => {
                            return <li className="link-edit-li">
                                
                                <input type="text" value={links[index].text} placeholder={`Link #${index + 1} text`} onChange={e => {
                                    const newLinks = links.slice();
                                    newLinks[index].text = e.target.value;
                                    setLinks(newLinks);
                                }} />
                                <input type="text" value={links[index].href} placeholder={`Link #${index + 1} URI`} onChange={e => {
                                    const newLinks = links.slice();
                                    newLinks[index].href = e.target.value;
                                    setLinks(newLinks);
                                }} />
                                <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => deleteLink(index)} color="red" className="delete-link" />
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
                    <h1>General Settings</h1>
                    <h2>Container Color</h2>
                    <HexColorPicker color={containerColor} onChange={setContainerColor} />
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)}>Title Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}>Image Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.LINKS)}>Link Settings</button>
                </div>
        }
    }

    const shouldBlockNavigation = () => {
        return (
            title !== site.title ||
            subtitle !== site.subtitle ||
            (headerImage?.url !== site.headerImage?.url || headerImage?.base64 !== site.headerImage?.base64) ||
            (backgroundImage?.url !== site.backgroundImage?.url || backgroundImage?.base64 !== site.backgroundImage?.base64) ||
            JSON.stringify(links) !== JSON.stringify(site.links) ||
            titlesColor !== site?.titlesColor ||
            containerColor !== site?.containerColor ||
            linkTextColor !== site?.linkTextColor ||
            linkBackgroundColor !== site?.linkBackgroundColor
        )
    }

    useEffect(() => {
        const isCurrentlyDirty = shouldBlockNavigation();
        if (isCurrentlyDirty !== isDirty) {
            setIsDirty(isCurrentlyDirty);
        }
    })

    const getDisplayContents = (thisTitle, thisSubtitle, thisHeaderImage, theseLinks, titlesColor, thisContainerColor, thisLinkTextColor, thisLinkBackgroundColor) => {
        return <div className="container">
             <div className="single-site-container" style={{ backgroundColor: thisContainerColor }}>
                <Prompt when={isDirty} />
                <div className="edit-button" style={{color: thisContainerColor ? invert(thisContainerColor, true) : "grey"}}>
                    { isEditing ? 
                        null
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => setIsEditing(true)} />
                    }
                </div>
                <img 
                    src={thisHeaderImage || "https://via.placeholder.com/300x300?text=image+here"} 
                    alt={title} className="header-image"
                    onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                    width="200" height="200"
                />
                <h1 className="single-title" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisTitle}</h1>
                <h3 className="single-subtitle" onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisSubtitle}</h3>
                {links ?
                    <ul className="links-list">
                        {theseLinks?.map((link) => {
                            return <li onClick={() => onLinkClick(link.href)} className="individual-link" style={{ color: thisLinkTextColor, backgroundColor: thisLinkBackgroundColor }}>
                                <div className="link-text">{link.text}</div>
                                <FontAwesomeIcon icon={link?.icon?.split("_")} />
                            </li>
                        })}
                    </ul>
                : null}
            </div>
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
                getDisplayContents(title, subtitle, headerImage?.base64 || headerImage?.url, links, titlesColor, containerColor, linkTextColor, linkBackgroundColor)
                :
                getDisplayContents(site.title, site.subtitle, site.headerImage?.base64 || site.headerImage?.url, site.links, site.titlesColor, site.containerColor, site.linkTextColor, site.linkBackgroundColor)
            }
            { isModalShowing ?
                <>
                    <div className="blocker" onClick={() => setIsModalShowing(false)}></div>
                    <div className="pexels-modal">
                        <span>Find and select a photo for your {modalOpenedWith} image from <a href="https://www.pexels.com">Pexels</a></span>
                        <form className="pexels-search" onSubmit={fetchPexels}>
                            <input type="text" value={query} placeholder="Search" onChange={e => setQuery(e.target.value)} />
                            <button onClick={fetchPexels} type="submit">Search</button>
                        </form>
                        <div className="photos">
                            {photos?.map(photo => {
                                return <img src={photo.src.tiny} width="100" height="100" onClick={
                                        modalOpenedWith === IMAGE_TYPE.BACKGROUND ? () => setBackgroundImage({url: photo.src.original}) : () => setHeaderImage({url: photo.src.original})
                                    }
                                />
                            })}
                        </div>
                    </div>
                </>
                : null
            }
        </>
    )
}

export default SingleSite;