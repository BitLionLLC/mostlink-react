import axios from 'axios';
import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouteMatch, Prompt } from 'react-router';
import { useHistory } from 'react-router-dom';
import { SitesContext } from '../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileBase64 from 'react-file-base64';
import { HexColorPicker } from "react-colorful";
import { useBeforeunload } from 'react-beforeunload';
import GradientPicker from './gradientPicker';
import EditableLink from './editableLink';
import update from 'immutability-helper';
import Picker from 'emoji-picker-react';
import styles from './singleSite.module.css';
import defaultHeader from './assets/default-header.png';
import toHex from 'colornames';
import { toast } from 'react-toastify';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import ANIMATION_PRESETS from "./assets/particlesPresets";

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

    const [isEditing, setIsEditing] = useState(false);
    const [whatIsBeingEdited, setWhatIsBeingEdited] = useState(EDIT_TYPE.ALL);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [headerImage, setHeaderImage] = useState("");
    const [headerEmoji, setHeaderEmoji] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");
    const [links, setLinks] = useState([]);
    const [titlesColor, setTitlesColor] = useState("#000000");
    const titlesColorRef = useRef(titlesColor);
    const [containerColor, setContainerColor] = useState("#ADD8E6");
    const containerColorRef = useRef(containerColor);
    const [containerGradient, setContainerGradient] = useState("");
    const [bodyColor, setBodyColor] = useState("#FFFFFF");
    const bodyColorRef = useRef(bodyColor);
    const [bodyGradient, setBodyGradient] = useState("");
    const [bodyAnimationStyle, setBodyAnimationStyle] = useState("");
    const [linkTextColor, setLinkTextColor] = useState("#000000");
    const linkTextColorRef = useRef(linkTextColor);
    const [linkBackgroundColor, setLinkBackgroundColor] = useState("#FFFFFF");
    const linkBackgroundColorRef = useRef(linkBackgroundColor);
    const [liveNotificationColor, setLiveNotificationColor] = useState("#FF0000");
    const liveNotificationColorRef = useRef(liveNotificationColor);
    const [isPexelsModalShowing, setIsPexelsModalShowing] = useState(false);
    const [modalOpenedWith, setModalOpenedWith] = useState("");
    const [photos, setPhotos] = useState([]);
    const [query, setQuery] = useState("abstract");
    const [isDirty, setIsDirty] = useState(false);
    const [isEditButtonVisible, setIsEditButtonVisible] = useState(true);
    const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
    const [isCheckDomainModalShowing, setIsCheckDomainModalShowing] = useState(false);
    const [isRegisterDomainModalShowing, setIsRegisterDomainModalShowing] = useState(false);
    const [isDeleteDomainModalShowing, setIsDeleteDomainModalShowing] = useState(false);
    const [domains, setDomains] = useState([]);
    const [domainToAdd, setDomainToAdd] = useState("");
    const [domainToDelete, setDomainToDelete] = useState("");
    const [isDomainAvailable, setIsDomainAvailable] = useState(false);
    const [hasDomainBeenChecked, setHasDomainBeenChecked] = useState(false);
    const [hasDomainBeenRegistered, setHasDomainBeenRegistered] = useState(false);

    const HEX_COLOR_REGEX_SHORT = "^#(?:[0-9a-fA-F]{3}){1}$";
    const HEX_COLOR_REGEX_LONG = "^#(?:[0-9a-fA-F]{2}){3,4}$";
    
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
            .get(`/api/sites/fetch-domains/${match.params.id}`)
            .then(res => {
                const domains = res.data;
                domains.forEach(data => {
                    axios
                        .put(`/api/sites/update-domain/`, { domain: data.domain })
                })
            })
            .then(() => {
                axios
                    .get(`/api/sites/fetch-domains/${match.params.id}`)
                    .then(res => setDomains(res.data))
            })
    }

    useEffect(() => {
        document.body.style.backgroundImage = null;
        fetchSite(match.params.id);
        fetchPexels();
        fetchSiteDomains();
    }, [])

    useEffect(() => {
        document.body.style.backgroundImage = bodyGradient || null;
    }, [bodyGradient])

    useEffect(() => {
        const linksWithLive = links && links.map(link => {
            if (link.live) {
                const { type, meta } = link.live;

                axios
                    .get(`/api/sites/${type}/${meta}`)
                    .then(res => {
                        if (res.data.isLive) {
                            link.live.isLive = true;
                        } else {
                            link.live.isLive = false;
                        }
                    })
                    .catch(err => console.error(err))
            }
            return link;
        })

        if (JSON.stringify(links) !== JSON.stringify(linksWithLive)) {
            setLinks(linksWithLive);
        }
    }, [links])

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
        setLiveNotificationColor(site.liveNotificationColor);
        setBodyGradient(site.bodyGradient);
        setContainerGradient(site.containerGradient);
        setBodyAnimationStyle(site.bodyAnimationStyle);
    }, [site])

    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgroundImage?.base64 || backgroundImage?.url})`;
    }, [backgroundImage])

    useEffect(() => {
        if (bodyAnimationStyle) {
            const color = ANIMATION_PRESETS[bodyAnimationStyle]['background']['color'];
        
            if (color?.match(HEX_COLOR_REGEX_SHORT) ||  color?.match(HEX_COLOR_REGEX_LONG)) {
                setBodyColor(color);
            }
        }
    }, [bodyAnimationStyle])


    useBeforeunload((e) => {
        if (isDirty) {
            e.preventDefault();
        }
    })

    const stripIsLiveFromLinks = () => {
        return links.map(link => {
            if (link.live) {
                delete link.live.isLive;
            }

            return link;
        })
    }

    const onSave = () => {
        const siteToSave = {
            title,
            subtitle,
            headerImage,
            headerEmoji,
            backgroundImage,
            links: stripIsLiveFromLinks(),
            titlesColor,
            containerColor,
            bodyColor,
            linkTextColor,
            linkBackgroundColor,
            liveNotificationColor,
            bodyGradient,
            containerGradient,
            bodyAnimationStyle
        }

        axios
            .put(`/api/sites/siteId/${match.params.id}`, siteToSave)
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

    const openCheckDomainModal = () => {
        setIsCheckDomainModalShowing(true);
    }

    const closeCheckDomainModal = () => {
        setIsCheckDomainModalShowing(false);
        setDomainToAdd("");
        setIsDomainAvailable(false);
        setHasDomainBeenChecked(false);
        setHasDomainBeenRegistered(false);
    }

    const openRegisterDomainModal = () => {
        setIsCheckDomainModalShowing(false);
        setIsRegisterDomainModalShowing(true);
    }

    const closeRegisterDomainModal = () => {
        setIsRegisterDomainModalShowing(false);
        setDomainToAdd("");
        setIsDomainAvailable(false);
        setHasDomainBeenChecked(false);
        setHasDomainBeenRegistered(false);
    }

    const openDeleteDomainModal = (domain) => {
        setIsDeleteDomainModalShowing(true);
        setDomainToDelete(domain);
    }

    const closeDeleteDomainModal = () => {
        setIsDeleteDomainModalShowing(false);
        setDomainToDelete("");
    }

    const checkDomain = () => {
        let properDomain = domainToAdd;

        if (properDomain.startsWith('https://')) {
            properDomain = properDomain.replace('https://', '')
        }

        if (properDomain.startsWith('http://')) {
            properDomain = properDomain.replace('http://', '')
        }

        if (properDomain.startsWith('www.')) {
            properDomain = properDomain.replace('www.', '')
        }

        setDomainToAdd(properDomain);

        axios
            .get(`/api/sites/check-domain/${properDomain}`)
            .then(res => {
                setIsDomainAvailable(res.data.domain.isAvailable);
                setHasDomainBeenChecked(true);
            })
            .catch(err => toast(err, { type: "error" }))
    }

    const registerDomain = () => {
        const body = {
            domain: domainToAdd,
            siteId: match.params.id
        }

        axios
            .post('/api/sites/register-domain', body)
            .then(() => {
                setHasDomainBeenRegistered(true);
                fetchSiteDomains();
            })
            .catch(err => toast(err, { type: "error" }))
    }

    const deleteDomain = () => {
        axios
            .delete(`/api/sites/delete-domain/${domainToDelete}`)
            .then(() => {
                toast("Domain successfully deleted.", { type: "success" })
                setIsDeleteDomainModalShowing(false);
                fetchSiteDomains();
            })
            .catch(err => toast("Could not delete the domain. Please try again.", { type: "error" }))
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

    const standardizeColorInput = (input, setterCallback, ref) => {
        setterCallback(input);
    
        const isHex = input.match(HEX_COLOR_REGEX_SHORT) || input.match(HEX_COLOR_REGEX_LONG);
        const allColorNames = toHex.all().map(color => color.name);

        if (isHex) {
            setterCallback(input.toUpperCase());
            ref.current = input.toUpperCase();
        } else if (allColorNames.includes(input)) {
            setterCallback(toHex(input).toUpperCase());
            ref.current = toHex(input).toUpperCase();
        } else {
            ref.current = input;
        }

        setTimeout(() => {
            const { current } = ref;

            if (!(current.match(HEX_COLOR_REGEX_SHORT)) && !(current.match(HEX_COLOR_REGEX_LONG)) ) {
                setterCallback("#000000");
                ref.current = "#000000";
            }
        }, 5000)
    }

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
                    <input type="text" value={titlesColor} onChange={e => standardizeColorInput(e.target.value, setTitlesColor, titlesColorRef)} className={styles.hexInput} />
                </div>
            case EDIT_TYPE.IMAGES:
                return <div className={styles.editContents}>
                        <h1>Images</h1>
                        <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className={styles.backArrow} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                        
                        <div className={styles.titleAndClear}>
                            <h2>Header Image</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderImage("")} color="salmon" className={styles.clearImage} />
                        </div>
                        <div className={styles.headerWarning}>Note: Emojis override images in the header. You can clear an emoji to use an image.</div>
                        <img src={headerImage?.base64 || headerImage?.url || defaultHeader} width="200" height="200" alt="header" className={styles.editImage} />
                        <div className={styles.imageInput}><FileBase64 multiple={false} onDone={(file) => setHeaderImage(file)} /></div>
                        <button onClick={() => openPexelsModal(IMAGE_TYPE.HEADER)}>Choose from Pexels</button>
                        
                        <div className={styles.titleAndClear}>
                            <h2>Header Emoji</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setHeaderEmoji("")} color="salmon" className={styles.clearImage}/>
                        </div>
                        {headerEmoji && <div className={styles.selectedEmoji}>{headerEmoji}</div>}
                        <Picker onEmojiClick={onEmojiClick} />
                        
                        <div className={styles.titleAndClear}>
                            <h2>Background Image</h2>
                            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => setBackgroundImage("")} color="salmon" className={styles.clearImage}/>
                        </div>
                        <img src={backgroundImage?.base64 || backgroundImage?.url || defaultHeader} width="200" height="200" alt="background" className={styles.editImage} />
                        <div className={styles.imageInput}><FileBase64 multiple={false} onDone={(file) => setBackgroundImage(file)}  /></div>
                        <button onClick={() => openPexelsModal(IMAGE_TYPE.BACKGROUND)}>Choose from Pexels</button>
                    </div>
            case EDIT_TYPE.LINKS:
                return <div className={styles.editContents}>
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} size="3x" className={styles.backArrow} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.ALL)} />
                    <h1>Links</h1>
                    <h2>Link Text Color</h2>
                    <HexColorPicker color={linkTextColor} onChange={e => setLinkTextColor(e.toUpperCase())} />
                    <input type="text" value={linkTextColor} onChange={e => standardizeColorInput(e.target.value, setLinkTextColor, linkTextColorRef)} className={styles.hexInput} />
                    <h2>Link Background Color</h2>
                    <HexColorPicker color={linkBackgroundColor} onChange={e => setLinkBackgroundColor(e.toUpperCase())} />
                    <input type="text" value={linkBackgroundColor} onChange={e => standardizeColorInput(e.target.value, setLinkBackgroundColor, linkBackgroundColorRef)} className={styles.hexInput} />
                    <h2>Live Notification Color</h2>
                    <HexColorPicker color={liveNotificationColor} onChange={e => setLiveNotificationColor(e.toUpperCase())} />
                    <input type="text" value={liveNotificationColor} onChange={e => standardizeColorInput(e.target.value, setLiveNotificationColor, liveNotificationColorRef)} className={styles.hexInput} />
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
                    <button onClick={openCheckDomainModal}>Add a domain</button>
                    {
                        domains.length ?
                            <>
                                <ul className={styles.domainList}>
                                    {domains.map(data => {
                                        return <li key={data.domain}>
                                            {data.domain}
                                            &nbsp;
                                            { data.isPointing ?
                                                <FontAwesomeIcon icon={["fas", "check"]} color="lightgreen" />
                                                :
                                                <FontAwesomeIcon icon={["fas", "window-close"]} color="salmon" />
                                            }
                                            &nbsp;
                                            <button onClick={() => openDeleteDomainModal(data.domain)}>Delete</button>
                                        </li>
                                    })}
                                </ul>
                                <p>Reminder: make sure each domain has an<br/>A record at its registrar pointing to our server address: {process.env.REACT_APP_SERVER_IP}</p>
                            </>
                            
                        :
                        <div>You have no domains.</div>
                    }
                    
                </div>
            default: // default and ALL
                return <div className={styles.editContents}>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} className={styles.generalButton}>Title Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)} className={styles.generalButton}>Image Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.LINKS)} className={styles.generalButton}>Link Settings</button>
                    <button onClick={() => setWhatIsBeingEdited(EDIT_TYPE.DOMAINS)} className={styles.generalButton}>Domain Settings</button>
                    <h1>General Settings</h1>
                    <h2>Body Color</h2>
                    <HexColorPicker color={bodyColor} onChange={e => setBodyColor(e.toUpperCase())} />
                    <input type="text" value={bodyColor} onChange={e => standardizeColorInput(e.target.value, setBodyColor, bodyColorRef)} className={styles.hexInput} />
                    <h2>Body Gradient</h2>
                    <GradientPicker setter={value => setBodyGradient(value)} value={bodyGradient} place="body" isContainerTransparent={null} />
                    <h2>Body Animation</h2>
                    <select value={bodyAnimationStyle} onChange={e => setBodyAnimationStyle(e.target.value)}>
                        <option value="">none</option>
                        <option value="absorbers">absorbers</option>
                        <option value="amongUs">amongUs</option>
                        <option value="background">background</option>
                        <option value="big">big</option>
                        <option value="bubble">bubble</option>
                        <option value="chars">chars</option>
                        <option value="collisions">collisions</option>
                        <option value="confetti">confetti</option>
                        <option value="connect">connect</option>
                        <option value="defaultAnim">default</option>
                        <option value="divRepulse">divRepulse</option>
                        <option value="emmiterAbsorber">emmiterAbsorber</option>
                        <option value="emitters">emitters</option>
                        <option value="fontawesome">fontawesome</option>
                        <option value="growing">growing</option>
                        <option value="hollowknight">hollowknight</option>
                        <option value="images">images</option>
                        <option value="multiplePolygonMasks">multiplePolygonMasks</option>
                        <option value="nasa">nasa</option>
                        <option value="noconfig">noconfig</option>
                        <option value="nyancat">nyancat</option>
                        <option value="nyancat2">nyancat2</option>
                        <option value="parallax">parallax</option>
                        <option value="polygonMask">polygonMask</option>
                        <option value="polygons">polygons</option>
                        <option value="preset">preset</option>
                        <option value="random">random</option>
                        <option value="shadow">shadow</option>
                        <option value="slow">slow</option>
                        <option value="snow">snow</option>
                        <option value="star">star</option>
                        <option value="trail">trail</option>
                        <option value="twinkle">twinkle</option>
                        <option value="virus">virus</option>
                        <option value="warp">warp</option>
                    </select>

                    <h2>Container Color</h2>
                    <HexColorPicker color={containerColor} onChange={e => setContainerColor(e.toUpperCase())} />
                    <input type="text" value={containerColor} onChange={e => standardizeColorInput(e.target.value, setContainerColor, containerColorRef)} className={styles.hexInput} />
                    <h3>Transparent?</h3>
                    <input type="checkbox" checked={containerColor === '#00000000'} onChange={e => e.target.checked ? setContainerColor('#00000000'): setContainerColor("#ADD8E6")}/>
                    <h2>Container Gradient</h2>
                    <GradientPicker setter={value => setContainerGradient(value)} value={containerGradient} place="container" isContainerTransparent={containerColor === '#00000000'} />
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
            headerEmoji !== site?.headerEmoji ||
            liveNotificationColor !== site?.liveNotificationColor ||
            bodyGradient !== site?.bodyGradient ||
            containerGradient !== site?.containerGradient ||
            bodyAnimationStyle !== site?.bodyAnimationStyle
        )
    }

    const deleteSite = () => {
        axios
            .delete(`/api/sites/siteId/${site._id}`)
            .then(res => {
                toast("Site deleted.", { type: "success" })
                history.push("/home");
            })
            .catch(err => {
                toast(err, { type: "error" })
            })
    }

    const particlesInit = async (main) => {
        // console.log(main);
    
        // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        await loadFull(main);
    };
    
      const particlesLoaded = (container) => {
        // console.log(container);
    };

    useEffect(() => {
        const isCurrentlyDirty = shouldBlockNavigation();
        if (isCurrentlyDirty !== isDirty) {
            setIsDirty(isCurrentlyDirty);
        }
    }, [title, subtitle, headerImage, headerEmoji, links, backgroundImage, titlesColor, containerColor, containerGradient, bodyColor, bodyGradient, linkTextColor, linkBackgroundColor, liveNotificationColor, bodyAnimationStyle])

    const getDisplayContents = (thisTitle, thisSubtitle, thisHeaderImage, theseLinks, titlesColor, thisContainerColor, thisContainerGradient, thisBodyColor, thisBodyGradient, thisLinkTextColor, thisLinkBackgroundColor, thisLiveNotificationColor, thisBodyAnimationStyle) => {
        document.body.style.backgroundColor = thisBodyColor;
        document.body.style.backgroundImage = thisBodyGradient;
        
        return <div className={styles.singleSiteWrapper} style={{ justifyContent: isEditing ? 'flex-end' : 'center', paddingRight: isEditing ? '50px': 0 }}>
            {thisBodyAnimationStyle && <Particles id="tsparticles" init={particlesInit} loaded={particlesLoaded} options={{...ANIMATION_PRESETS[thisBodyAnimationStyle], autoplay: true}} style={{height: '100vh', width: '100vw'}} />}
             <div className={styles.singleSiteContainer} style={{ backgroundColor: thisContainerColor, backgroundImage: thisContainerGradient }}>
                <Prompt when={isDirty} message='Reload site? Changes you made may not be saved.' />
                <div className={styles.editButton} style={{color: "darkgrey"}}>
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
                            src={thisHeaderImage || defaultHeader} 
                            alt={title} className={styles.headerImage}
                            onClick={() => setWhatIsBeingEdited(EDIT_TYPE.IMAGES)}
                            width="200" height="200"
                        />
                }
                <h1 className={styles.singleTitle} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisTitle}</h1>
                <h3 className={styles.singleSubtitle} onClick={() => setWhatIsBeingEdited(EDIT_TYPE.TITLES)} style={{ color: titlesColor }}>{thisSubtitle}</h3>
                {links ?
                    <ul className={styles.linksList}>
                        {theseLinks?.map((link, i) => {
                            return <a href={link.href.startsWith("http") ? link.href : "https://" + link.href} target="_blank" rel="noreferrer" className={styles.individualLink} style={{ color: thisLinkTextColor, backgroundColor: thisLinkBackgroundColor }} key={i} >
                                <div className={styles.linkTextAndLiveStatus}>
                                    <div className={styles.linkText}>{link.text}</div>
                                    {link.live ? <div>{link.live.isLive ? <><span>-</span><span style={{color: thisLiveNotificationColor}}> LIVE!</span></> : "- not live"}</div> : null}
                                </div>
                                <FontAwesomeIcon icon={link?.icon?.split("_")} />
                            </a>
                        })}
                    </ul>
                : null}
            </div>
        </div>
    }

    return (
        <>
            { isEditing ? 
                <div className={styles.editTray}>
                    <div className={styles.saveAndCancelButtons}>
                        <FontAwesomeIcon icon={["far", "save"]} size="3x" onClick={onSave} color="lightgreen" />
                        <FontAwesomeIcon icon={["far", "window-close"]} size="3x" onClick={onCancel} color="salmon" />
                    </div>
                    { getEditContents() }
                </div>
                :
                null
            }
            { isEditing ?
                getDisplayContents(title, subtitle, headerImage?.base64 || headerImage?.url, links, titlesColor, containerColor, containerGradient, bodyColor, bodyGradient, linkTextColor, linkBackgroundColor, liveNotificationColor, bodyAnimationStyle)
                :
                getDisplayContents(site.title, site.subtitle, site.headerImage?.base64 || site.headerImage?.url, site.links, site.titlesColor, site.containerColor, site.containerGradient, site.bodyColor, site.bodyGradient, site.linkTextColor, site.linkBackgroundColor, site.liveNotificationColor, site.bodyAnimationStyle)
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
                        <p>Are you sure you want to delete this site? Your site will be lost forever (a long time!)</p>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.cancelButton} onClick={() => setIsDeleteModalShowing(false)}>Cancel</button>
                            <button className={styles.deleteButton} onClick={deleteSite}>Delete</button>
                        </div>
                    </div>
                </>
            : null }
            { isCheckDomainModalShowing ?
                !hasDomainBeenChecked ?
                <>
                    <div className={styles.blocker} onClick={closeCheckDomainModal}></div>
                    <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={closeCheckDomainModal}>+</div>
                        <h1>Add a domain</h1>
                        <input type="text" name="domainToAdd" value={domainToAdd} onChange={(e) => setDomainToAdd(e.target.value)} placeholder="Domain" className={styles.domainToAdd} />
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.deleteButton} onClick={closeCheckDomainModal}>Cancel</button>
                            <button className={styles.cancelButton} onClick={checkDomain}>Add</button>
                        </div>
                    </div>
                </>
                :
                isDomainAvailable ?
                <>
                    <div className={styles.blocker} onClick={closeCheckDomainModal}></div>
                        <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={closeCheckDomainModal}>+</div>
                        <h1>This domain is available</h1>
                        <h2>{domainToAdd}</h2>
                        <p>Please register this domain through your favorite registrar and come back. We plan on adding a domain registration feature in the future.</p>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.cancelButton} onClick={closeCheckDomainModal}>Okay</button>
                        </div>
                    </div>
                </>
                :
                <>
                    <div className={styles.blocker} onClick={closeCheckDomainModal}></div>
                        <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={closeCheckDomainModal}>+</div>
                        <h1>Domain taken</h1>
                        <h2>Do you own this domain?</h2>
                        <h2>{domainToAdd}</h2>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.deleteButton} onClick={closeCheckDomainModal}>No</button>
                            <button className={styles.cancelButton} onClick={openRegisterDomainModal}>Yes</button>
                        </div>
                    </div>
                </>
            : null
            }
            { isRegisterDomainModalShowing ?
                !hasDomainBeenRegistered ?
                <>
                    <div className={styles.blocker} onClick={closeRegisterDomainModal}></div>
                    <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={closeRegisterDomainModal}>+</div>
                        <h1>Register a domain</h1>
                        <h2>Do you want to register this domain? {domainToAdd}</h2>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.deleteButton} onClick={closeRegisterDomainModal}>Cancel</button>
                            <button className={styles.cancelButton} onClick={registerDomain}>Register</button>
                        </div>
                    </div>
                </>
                :
                <>
                    <div className={styles.blocker} onClick={closeRegisterDomainModal}></div>
                    <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={closeRegisterDomainModal}>+</div>
                        <h1>Registered!</h1>
                        <h2>{domainToAdd}</h2>
                        <p>Please add an A record at your registrar<br/>that points at our server: {process.env.REACT_APP_SERVER_IP}</p>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.cancelButton} onClick={closeRegisterDomainModal}>Okay</button>
                        </div>
                    </div>
                </>
            : null
            }
            { isDeleteDomainModalShowing ?
                <>
                    <div className={styles.blocker} onClick={closeDeleteDomainModal}></div>
                    <div className={styles.deleteSiteModal}>
                        <div className={styles.closeButton} onClick={closeDeleteDomainModal}>+</div>
                        <h1>Delete domain</h1>
                        <h2>Are you sure you want to delete this domain? {domainToDelete}</h2>
                        <div className={styles.deleteSiteButtons}>
                            <button className={styles.cancelButton} onClick={closeDeleteDomainModal}>Cancel</button>
                            <button className={styles.deleteButton} onClick={deleteDomain}>Delete</button>
                        </div>
                    </div>
                </>
            : null
            }
        </>
    )
}

export default SingleSite;