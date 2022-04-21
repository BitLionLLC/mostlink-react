import axios from 'axios';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useRouteMatch, Prompt } from 'react-router';
import { useHistory } from 'react-router-dom';
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
import styles from './singleSite.module.css';
import { toast } from 'react-toastify';

const EDIT_TYPE = {
    ALL: "all",
    TITLES: "titles",
    IMAGES: "images",
    LINKS: "links",
    DOMAINS: "domains"
}

const IMAGE_TYPE = {
    HEADER: "header",
    BACKGROUND: "background"
}

const SingleSite = () => {
    const { site, fetchSite } = useContext(SitesContext);
    const match = useRouteMatch();
    const history = useHistory();

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
    const [isPexelsModalShowing, setIsPexelsModalShowing] = useState(false);
    const [modalOpenedWith, setModalOpenedWith] = useState("");
    const [photos, setPhotos] = useState([]);
    const [query, setQuery] = useState("abstract");
    const [isDirty, setIsDirty] = useState(false);
    const [isEditButtonVisible, setIsEditButtonVisible] = useState(true);
    const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
    const [domains, setDomains] = useState([]);

    const captureScreenshot = () => {
        html2canvas(document.getElementById("screenshot-area"), { allowTaint: true, useCORS: true, letterRendering: 1, }).then((canvas) => {      
            const imgData = canvas.toDataURL('image/png');
            setScreenshot(imgData);
        });
    }
    
    const fetchPexels = (e) => {
        e?.preventDefault();

        axios
            .get(`https://api.pexels.com/v1/search?query=${query}&per_page=50`, {transformRequest: (data, headers) => {
                delete headers['X-CSRF-Token'];
                headers['Authorization'] = "563492ad6f9170000100000180348db710564c64a1b0dc2f260570b2";
                return data;
              }})
            .then(res => setPhotos(res.data.photos))
            .catch(err => console.error(err))
    }

    const fetchSiteDomains = () => {
        axios
            .get(`/sites/fetch-domains/${match.params.id}`)
            .then(res => setDomains(res.data))
    }

    useEffect(() => {
        document.body.style.backgroundImage = null;
        fetchSite(match.params.id);
        fetchPexels();
        fetchSiteDomains();
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

    const openPexelsModal = (component) => {
        setIsPexelsModalShowing(true);
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
            case EDIT_TYPE.TITLES:
                return <div className={styles.editContents}>
                    <h1>Titles</h1>
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className={styles.backArrow} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h2>Title</h2>
                    <input type="text" value={title} placeholder="Title" onChange={e => setTitle(e.target.value)} />
                    <h2>Subtitle</h2>
                    <input type="text" value={subtitle} placeholder="Subtitle" onChange={e => setSubtitle(e.target.value)} />
                    <h2>Title Color</h2>
                    <HexColorPicker color={titlesColor} onChange={setTitlesColor} />
                </div>
            case EDIT_TYPE.IMAGES:
                return <div className={styles.editContents}>
                        <h1>Images</h1>
                        <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className={styles.backArrow} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                        
                        <div className={styles.titleAndClear}>
                            <h2>Header Image</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderImage("")} color="red" className={styles.clearImage} />
                        </div>
                        {headerImage && headerEmoji && <div className={styles.headerWarning}>You have an image and an emoji selected. Emojis override images in the header. Clear the emoji to use the image.</div>}
                        <img src={headerImage?.base64 || headerImage?.url || "https://via.placeholder.com/300x300?text=select+an+image"} width="300" height="300" alt="header" />
                        <FileBase64 multiple={false} onDone={(file) => setHeaderImage(file)} />
                        <button onClick={() => openPexelsModal(IMAGE_TYPE.HEADER)}>Choose from Pexels</button>
                        
                        <div className={styles.titleAndClear}>
                            <h2>Header Emoji</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderEmoji("")} color="red" className={styles.clearImage}/>
                        </div>
                        {headerEmoji && <div className={styles.selectedEmoji}>{headerEmoji}</div>}
                        <Picker onEmojiClick={onEmojiClick} />
                        
                        <div className={styles.titleAndClear}>
                            <h2>Background Image</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setBackgroundImage("")} color="red" className={styles.clearImage}/>
                        </div>
                        <img src={backgroundImage?.base64 || backgroundImage?.url || "https://via.placeholder.com/300x300?text=select+an+image"} width="300" height="300" alt="background" />
                        <FileBase64 multiple={false} onDone={(file) => setBackgroundImage(file)} />
                        <button onClick={() => openPexelsModal(IMAGE_TYPE.BACKGROUND)}>Choose from Pexels</button>
                    </div>
            case EDIT_TYPE.LINKS:
                return <div className={styles.editContents}>
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className={styles.backArrow} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h1>Links</h1>
                    <h2>Link Text Color</h2>
                    <HexColorPicker color={linkTextColor} onChange={setLinkTextColor} />
                    <h2>Link Background Color</h2>
                    <HexColorPicker color={linkBackgroundColor} onChange={setLinkBackgroundColor} />
                    <h2>Links</h2>
                    <ul className={styles.linkEditList}>
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
            case EDIT_TYPE.DOMAINS:
                return <div className={styles.editContents}>
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className={styles.backArrow} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h1>Domains</h1>
                    <h2>Subdomain</h2>
                    {site.subdomain}.mostcard.io
                    <h2>Domains</h2>
                    {
                        domains.length ?
                            <ul>
                                {domains.map(domain => {
                                    return <li>{domain}</li>
                                })}
                            </ul>
                        :
                        <div>You have no domains.</div>
                    }
                    <button>Add a domain</button>
                </div>
            default: // default and ALL
                return <div className={styles.editContents}>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} className={styles.generalButton}>Title Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)} className={styles.generalButton}>Image Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.LINKS)} className={styles.generalButton}>Link Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.DOMAINS)} className={styles.generalButton}>Domain Settings</button>
                    <h1>General Settings</h1>
                    <h2>Body Color</h2>
                    <HexColorPicker color={bodyColor} onChange={setBodyColor} />
                    <h2>Container Color</h2>
                    <HexColorPicker color={containerColor} onChange={setContainerColor} />
                    <button onClick={() => setIsDeleteModalShowing(true)} className={styles.deleteSiteButton}>Delete Site</button>
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

    const deleteSite = () => {
        axios
            .delete(`/sites/siteId/${site._id}`)
            .then(res => {
                toast("Site deleted.", { type: "success" })
                history.push("/home");
            })
            .catch(err => {
                toast(err, { type: "error" })
            })
    }

    useEffect(() => {
        const isCurrentlyDirty = shouldBlockNavigation();
        if (isCurrentlyDirty !== isDirty) {
            setIsDirty(isCurrentlyDirty);
        }
    }, [title, subtitle, headerImage, headerEmoji, links, backgroundImage, titlesColor, containerColor, bodyColor, linkTextColor, linkBackgroundColor])

    const getDisplayContents = (thisTitle, thisSubtitle, thisHeaderImage, theseLinks, titlesColor, thisContainerColor, thisBodyColor, thisLinkTextColor, thisLinkBackgroundColor) => {
        document.body.style.backgroundColor = thisBodyColor;
        
        return <div className={styles.singleSiteWrapper}>
            <div className={styles.screenshotArea} id="screenshot-area">
             <div className={styles.singleSiteContainer} style={{ backgroundColor: thisContainerColor }}>
                <Prompt when={isDirty} />
                <div className={styles.editButton} style={{color: thisContainerColor ? invert(thisContainerColor, true) : "grey"}}>
                    { isEditing || !isEditButtonVisible ? 
                        null
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => setIsEditing(true)} />
                    }
                </div>
                {
                    headerEmoji 
                    ?
                        <div className={styles.headerEmoji}>{headerEmoji}</div>
                    :
                        <img 
                            src={thisHeaderImage || "https://via.placeholder.com/300x300?text=image+here"} 
                            alt={title} className={styles.headerImage}
                            onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                            width="200" height="200"
                        />
                }
                <h1 className={styles.singleTitle} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisTitle}</h1>
                <h3 className={styles.singleSubtitle} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisSubtitle}</h3>
                {links ?
                    <ul className={styles.linksList}>
                        {theseLinks?.map((link) => {
                            return <a href={link.href} target="_blank" rel="noreferrer" className={styles.individualLink} style={{ color: thisLinkTextColor, backgroundColor: thisLinkBackgroundColor }}>
                                <div className={styles.linkText}>{link.text}</div>
                                <FontAwesomeIcon icon={link?.icon?.split("_")} />
                            </a>
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
                <div className={styles.editTray}>
                    <div className={styles.saveAndCancelButtons}>
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
            { isPexelsModalShowing ?
                <>
                    <div className={styles.blocker} onClick={() => setIsPexelsModalShowing(false)}></div>
                    <div className={styles.pexelsModal}>
                        <span>Find and select a photo for your {modalOpenedWith} image from <a href="https://www.pexels.com">Pexels</a></span>
                        <form className={styles.pexelsSearch} onSubmit={fetchPexels}>
                            <input type="text" value={query} placeholder="Search" onChange={e => setQuery(e.target.value)} />
                            <button onClick={fetchPexels} type="submit">Search</button>
                        </form>
                        <div className={styles.photos}>
                            {photos?.map(photo => {
                                return <img src={photo.src.tiny} alt="pexel result" width="100" height="100" onClick={
                                        modalOpenedWith === IMAGE_TYPE.BACKGROUND ? () => setBackgroundImage({url: photo.src.original}) : () => setHeaderImage({url: photo.src.original})
                                    }
                                />
                            })}
                        </div>
                    </div>
                </>
                : null
            }
            { isDeleteModalShowing ?
                <> 
                    <div className={styles.blocker} onClick={() => setIsDeleteModalShowing(false)}></div>
                    <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={() => setIsDeleteModalShowing(false)}>+</div>
                        <h1>Delete site</h1>
                        <p>Are you sure you want to delete this site? This action cannot be undone.</p>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.cancelButton} onClick={() => setIsDeleteModalShowing(false)}>Cancel</button>
                            <button className={styles.deleteButton} onClick={deleteSite}>Delete</button>
                        </div>
                    </div>
                </>
            : null }
        </>
    )
}

export default SingleSite;