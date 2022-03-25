import axios from 'axios';
import React, { useContext, useEffect, useState, useCallback, createRef } from 'react';
import { useRouteMatch, Prompt } from 'react-router';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileBase64 from 'react-file-base64';
import { HexColorPicker } from "react-colorful";
import { useBeforeunload } from 'react-beforeunload';
import invert from 'invert-color';
import EditableLink from './editableLink';
import update from 'immutability-helper';
import Picker from 'emoji-picker-react';
import html2canvas from 'html2canvas';
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

    const [screenshot, setScreenshot] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [whatIsBeingEdited, setWhatIsBeingEdited] = useState(EDIT_TYPE.ALL);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [headerImage, setHeaderImage] = useState("");
    const [headerEmoji, setHeaderEmoji] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");
    const [links, setLinks] = useState([]);
    const [titlesColor, setTitlesColor] = useState("#000000");
    const [containerColor, setContainerColor] = useState("#ADD8E6");
    const [bodyColor, setBodyColor] = useState("#ffffff");
    const [linkTextColor, setLinkTextColor] = useState("#000000");
    const [linkBackgroundColor, setLinkBackgroundColor] = useState("#FFFFFF");
    const [isModalShowing, setIsModalShowing] = useState(false);
    const [modalOpenedWith, setModalOpenedWith] = useState("");
    const [photos, setPhotos] = useState([]);
    const [query, setQuery] = useState("abstract");
    const [isDirty, setIsDirty] = useState(false);
    const [isEditButtonVisible, setIsEditButtonVisible] = useState(true);

    const captureScreenshot = () => {
        html2canvas(document.getElementById("screenshot-area"), { allowTaint: true, useCORS: true, letterRendering: 1, }).then((canvas) => {      
            const imgData = canvas.toDataURL('image/png');
            setScreenshot(imgData);
        });
    }
    
    const fetchPexels = (e) => {
        e?.preventDefault();

        const headers = {
            Authorization: "563492ad6f9170000100000180348db710564c64a1b0dc2f260570b2"
        }

        axios
            .get(`https://api.pexels.com/v1/search?query=${query}&per_page=50`, {transformRequest: (data, headers) => {
                delete headers['X-CSRF-Token'];
                return data;
              }})
            .then(res => setPhotos(res.data.photos))
            .catch(err => console.error(err))
    }

    useEffect(() => {
        document.body.style.backgroundImage = null;
        fetchSite(match.params.id);
        fetchPexels();
    }, [])

    useEffect(() => {
        setTitle(site.title);
        setSubtitle(site.subtitle);
        setHeaderImage(site.headerImage);
        setHeaderEmoji(site.headerEmoji);
        setLinks(site.links);
        setBackgroundImage(site.backgroundImage);
        setTitlesColor(site.titlesColor);
        setContainerColor(site.containerColor);
        setBodyColor(site.bodyColor);
        setLinkTextColor(site.linkTextColor);
        setLinkBackgroundColor(site.linkBackgroundColor);

        setIsEditButtonVisible(false);
        setTimeout(() => {
            captureScreenshot();
        }, 500)
        setTimeout(() => {
            setIsEditButtonVisible(true);
        }, 1000)
    }, [site])

    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgroundImage?.base64 || backgroundImage?.url})`;
    }, [backgroundImage])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            captureScreenshot();
        }, 500)
    
        return () => clearTimeout(delayDebounceFn)
    }, [title, subtitle, headerImage, headerEmoji, links, backgroundImage, titlesColor, containerColor, bodyColor, linkTextColor, linkBackgroundColor])

    useBeforeunload((e) => {
        if (isDirty) {
            e.preventDefault();
        }
    })

    const onLinkClick = (linkHref) => {
        if (isEditing) {
            setWhatIsBeingEdited(EDIT_TYPE.LINKS);
        } else {
            window.location.assign(linkHref);
        }
    }

    const onSave = () => {
        setIsEditButtonVisible(false);
        captureScreenshot();
        setTimeout(() => {
            setIsEditButtonVisible(true);
        }, 1000)

        const siteToSave = {
            title,
            subtitle,
            headerImage,
            headerEmoji,
            backgroundImage,
            links,
            titlesColor,
            containerColor,
            bodyColor,
            linkTextColor,
            linkBackgroundColor,
            screenshot
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

    const addLink = () => {
        const newLinks = links.slice();
        newLinks.push({
            href: "https://www.google.com",
            text: "Google",
            icon: "fab_google",
            id: newLinks.length
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

    const moveLink = useCallback((dragIndex, hoverIndex) => {
        setLinks((prevLinks) => update(prevLinks, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, prevLinks[dragIndex]],
            ],
        }));
    }, []);

    const onEmojiClick = (event, emojiObject) => {
        setHeaderEmoji(emojiObject.emoji);
    };

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
                        
                        <div className="title-and-clear">
                            <h2>Header Image</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderImage("")} color="red" className="clear-image" />
                        </div>
                        {headerImage && headerEmoji && <div className="header-warning">You have an image and an emoji selected. Emojis override images in the header. Clear the emoji to use the image.</div>}
                        <img src={headerImage?.base64 || headerImage?.url || "https://via.placeholder.com/300x300?text=select+an+image"} width="300" height="300" />
                        <FileBase64 multiple={false} onDone={(file) => setHeaderImage(file)} />
                        <button onClick={() => openModal(IMAGE_TYPE.HEADER)}>Choose from Pexels</button>
                        
                        <div className="title-and-clear">
                            <h2>Header Emoji</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderEmoji("")} color="red" className="clear-image"/>
                        </div>
                        {headerEmoji && <div className="selected-emoji">{headerEmoji}</div>}
                        <Picker onEmojiClick={onEmojiClick} />
                        
                        <div className="title-and-clear">
                            <h2>Background Image</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setBackgroundImage("")} color="red" className="clear-image"/>
                        </div>
                        <img src={backgroundImage?.base64 || backgroundImage?.url || "https://via.placeholder.com/300x300?text=select+an+image"} width="300" height="300" />
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
                            return <EditableLink 
                                        link={link} 
                                        links={links} 
                                        setLinks={setLinks} 
                                        deleteLink={deleteLink} 
                                        moveLink={moveLink} 
                                        index={index} 
                                        key={link.id}
                                        id={link.id} />
                        })}
                    </ul>
                    <button onClick={addLink}>+</button>
                </div>
            default: // default and ALL
                return <div className="edit-contents">
                    <h1>General Settings</h1>
                    <h2>Body Color</h2>
                    <HexColorPicker color={bodyColor} onChange={setBodyColor} />
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
            linkBackgroundColor !== site?.linkBackgroundColor ||
            bodyColor !== site?.bodyColor ||
            headerEmoji !== site?.headerEmoji
        )
    }

    useEffect(() => {
        const isCurrentlyDirty = shouldBlockNavigation();
        if (isCurrentlyDirty !== isDirty) {
            setIsDirty(isCurrentlyDirty);
        }
    })

    const getDisplayContents = (thisTitle, thisSubtitle, thisHeaderImage, theseLinks, titlesColor, thisContainerColor, thisBodyColor, thisLinkTextColor, thisLinkBackgroundColor) => {
        document.body.style.backgroundColor = thisBodyColor;
        
        return <div className="single-site-wrapper">
            <div className="screenshot-area" id="screenshot-area">
             <div className="single-site-container" style={{ backgroundColor: thisContainerColor }}>
                <Prompt when={isDirty} />
                <div className="edit-button" style={{color: thisContainerColor ? invert(thisContainerColor, true) : "grey"}}>
                    { isEditing || !isEditButtonVisible ? 
                        null
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => setIsEditing(true)} />
                    }
                </div>
                {
                    headerEmoji 
                    ?
                        <div className="header-emoji">{headerEmoji}</div>
                    :
                        <img 
                            src={thisHeaderImage || "https://via.placeholder.com/300x300?text=image+here"} 
                            alt={title} className="header-image"
                            onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                            width="200" height="200"
                        />
                }
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
                getDisplayContents(title, subtitle, headerImage?.base64 || headerImage?.url, links, titlesColor, containerColor, bodyColor, linkTextColor, linkBackgroundColor)
                :
                getDisplayContents(site.title, site.subtitle, site.headerImage?.base64 || site.headerImage?.url, site.links, site.titlesColor, site.containerColor, site.bodyColor, site.linkTextColor, site.linkBackgroundColor)
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