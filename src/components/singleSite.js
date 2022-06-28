import axios from 'axios';
import React, { useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import invert from 'invert-color';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField, Checkbox } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { muiDarkTheme, muiLightTheme } from '../constants/themes';

const IMAGE_TYPE = {
    HEADER: "header",
    BACKGROUND: "background"
}

const particlesInit = async (main) => {
    // console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main);
};

const particlesLoaded = (container) => {
    return;
};

const SingleSite = () => {
    const { site, fetchSite, theme, themeObj } = useContext(SitesContext);
    const match = useRouteMatch();
    const history = useHistory();

    const [isEditing, setIsEditing] = useState(false);
    const [hasEditButtonBeenClicked, setHasEditButtonBeenClicked] = useState(false);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [headerImage, setHeaderImage] = useState("");
    const [headerEmoji, setHeaderEmoji] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");
    const [links, setLinks] = useState([]);
    const [titlesColor, setTitlesColor] = useState("#000000");
    const titlesColorRef = useRef(titlesColor);
    const [containerColor, setContainerColor] = useState("#ADD8E6");
    const [isContainerTransparent, setIsContainerTransparent] = useState(false);
    const [editButtonColor, setEditButtonColor] = useState("#000000");
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
    const [currentDomainCname, setCurrentDomainCname] = useState("");
    const [expandedAccordion, setExpandedAccordion] = useState(false);
    const [hoveredLinkIndex, setHoveredLinkIndex] = useState(null);

    const memoizedParticles = useMemo(() => <Particles id="tsparticles" init={particlesInit} loaded={particlesLoaded} options={{...ANIMATION_PRESETS[bodyAnimationStyle], autoplay: true}} style={{height: '100vh', width: '100vw'}} />)

    const HEX_COLOR_REGEX_SHORT = "^#(?:[0-9a-fA-F]{3}){1}$";
    const HEX_COLOR_REGEX_LONG = "^#(?:[0-9a-fA-F]{2}){3,4}$";
    
    const fetchPexels = (e) => {
        e?.preventDefault();

        axios
            .get(`https://api.pexels.com/v1/search?query=${query}&per_page=50`, {transformRequest: (data, headers) => {
                delete headers['X-CSRF-Token'];
                headers['Authorization'] = process.env.REACT_APP_PEXELS_API_KEY;
                return data;
              }})
            .then(res => setPhotos(res.data.photos))
            .catch(err => console.error(err))
    }

    const fetchSiteDomains = () => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/api/sites/fetch-domains/${match.params.id}`, { withCredentials: true })
            .then(res => {
                const domains = res.data;
                domains.forEach(data => {
                    axios
                        .put(`${process.env.REACT_APP_API_BASE}/api/sites/update-domain/`, { domain: data.domain }, { withCredentials: true })
                })
            })
            .then(() => {
                axios
                    .get(`${process.env.REACT_APP_API_BASE}/api/sites/fetch-domains/${match.params.id}`, { withCredentials: true })
                    .then(res => setDomains(res.data))
            })
    }

    useEffect(() => {
        document.body.style.backgroundImage = bodyGradient || null;
        fetchSite(match.params.id);
        fetchPexels();
        fetchSiteDomains();
    }, [])

    useEffect(() => {
        document.body.style.backgroundImage = bodyGradient || null;
    }, [bodyGradient])

    useEffect(() => {
        document.body.style.backgroundColor = bodyColor;
    }, [theme])

    useEffect(() => {
        const linksWithLive = links && links.map(link => {
            if (link.live) {
                const { type, meta } = link.live;

                axios
                    .get(`${process.env.REACT_APP_API_BASE}/api/sites/${type}/${meta}`, { withCredentials: true })
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
        setIsContainerTransparent(site.containerColor === "#00000000");
    }, [site])

    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgroundImage?.base64 || backgroundImage?.url})`;
    }, [backgroundImage])

    useEffect(() => {
        if (bodyAnimationStyle) {
            const color = ANIMATION_PRESETS[bodyAnimationStyle].background.color;
            setBodyColor(color.value || color);
        }
    }, [bodyAnimationStyle])

    useEffect(() => {
        let rgb = containerColor?.slice(0, 7);

        if (rgb?.match(HEX_COLOR_REGEX_SHORT) || rgb?.match(HEX_COLOR_REGEX_LONG)) {
            setEditButtonColor(invert(rgb, true));
        } else {
            const hex = toHex(rgb);
            if (hex?.match(HEX_COLOR_REGEX_SHORT) || hex?.match(HEX_COLOR_REGEX_LONG)) {
                setEditButtonColor(invert(hex, true));
            } else {
                setEditButtonColor("#888888");
            }
        }
    }, [containerColor])

    useEffect(() => {
        if (containerColor.length === 9) {
            const hex = containerColor.slice(7);
            if (hex === "00" && !isContainerTransparent) {
                setIsContainerTransparent(true);
            }
        }
    }, [containerColor])

    useEffect(() => {
        if (isContainerTransparent && containerColor !== "#00000000") {
            setContainerColor(containerColor.slice(0,7) + "00");
        } else {
            setContainerColor(containerColor.slice(0, 7))
        }
    }, [isContainerTransparent])


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
            .put(`${process.env.REACT_APP_API_BASE}/api/sites/siteId/${match.params.id}`, siteToSave, { withCredentials: true })
            .then(() => {
                setIsEditing(false);
                fetchSite(match.params.id);
            })
            .catch((e) => {
                console.error("Error saving site: " + e);
            })
    }

    const onCancel = () => {
        setIsEditing(false);
        fetchSite(match.params.id);
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
            .get(`${process.env.REACT_APP_API_BASE}/api/sites/check-domain/${properDomain}`, { withCredentials: true })
            .then(res => {
                setIsDomainAvailable(res.data.domain.isAvailable);
                setHasDomainBeenChecked(true);
            })
            .catch(err => toast(err, { type: "error" }))
    }

    const registerDomain = () => {
        const body = {
            domain: domainToAdd.startsWith("www.") ? domainToAdd : "www." + domainToAdd,
            siteId: match.params.id
        }

        axios
            .post(`${process.env.REACT_APP_API_BASE}/api/sites/register-domain`, body, { withCredentials: true })
            .then(res => {
                setHasDomainBeenRegistered(true);
                setCurrentDomainCname(res.data.cname);
                fetchSiteDomains();
            })
            .catch(err => toast(err, { type: "error" }))
    }

    const deleteDomain = () => {
        axios
            .delete(`${process.env.REACT_APP_API_BASE}/api/sites/delete-domain/${domainToDelete}`, { withCredentials: true })
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

    const handleAccordionChange = panel => (e, isExpanded) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    const getEditContents = () => {
        return <>
            <h1>Settings</h1>
            <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>General</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={styles.editContents}>
                        <h1>General</h1>
                        <h2>Body Color</h2>
                        <HexColorPicker color={bodyColor} onChange={e => setBodyColor(e.toUpperCase())} />
                        <TextField type="text" value={bodyColor} onChange={e => standardizeColorInput(e.target.value, setBodyColor, bodyColorRef)} className={styles.textField} size="small" variant="filled" />
                        <h2>Body Gradient</h2>
                        <GradientPicker setter={value => setBodyGradient(value)} value={bodyGradient} place="body" isContainerTransparent={null} />
                        <h2>Body Animation</h2>
                        <select value={bodyAnimationStyle} onChange={e => setBodyAnimationStyle(e.target.value)} style={{marginBottom: '20px'}}>
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
                        {bodyAnimationStyle && isEditing && <Particles id="tsparticlessmall" init={particlesInit} loaded={particlesLoaded} options={{...ANIMATION_PRESETS[bodyAnimationStyle], autoplay: true, fullScreen: { enable: false }, style: {height: '200px', width: '200px'}}} />}
                        <h2>Container Color</h2>
                        <HexColorPicker color={containerColor} onChange={e => setContainerColor(e.toUpperCase())} />
                        <TextField type="text" value={containerColor} onChange={e => standardizeColorInput(e.target.value, setContainerColor, containerColorRef)} className={styles.textField} size="small" variant="filled" />
                        <h3>Transparent?</h3>
                        <Checkbox checked={isContainerTransparent} onChange={e => setIsContainerTransparent(e.target.checked)} />
                        <h2>Container Gradient</h2>
                        <GradientPicker setter={value => setContainerGradient(value)} value={containerGradient} place="container" isContainerTransparent={containerColor === '#00000000'} />
                        <button onClick={() => setIsDeleteModalShowing(true)} className={styles.deleteSiteButton}>Delete Site</button>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
                >
                <Typography>Titles</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={styles.editContents}>
                        <h1>Titles</h1>
                        <h2>Title</h2>
                        <TextField type="text" value={title} placeholder="Title" onChange={e => setTitle(e.target.value)} className={styles.textField} size="small" variant="filled" />
                        <h2>Subtitle</h2>
                        <TextField type="text" value={subtitle} placeholder="Subtitle" onChange={e => setSubtitle(e.target.value)} className={styles.textField} size="small" variant="filled" />
                        <h2>Title Color</h2>
                        <HexColorPicker color={titlesColor} onChange={setTitlesColor} />
                        <TextField type="text" value={titlesColor} onChange={e => standardizeColorInput(e.target.value, setTitlesColor, titlesColorRef)} className={styles.textField} size="small" variant="filled" />
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedAccordion === 'panel3'} onChange={handleAccordionChange('panel3')}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3a-content"
                id="panel3a-header"
                >
                <Typography>Images</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={styles.editContents}>
                        <h1>Images</h1>
                        
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
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedAccordion === 'panel4'} onChange={handleAccordionChange('panel4')}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel4a-content"
                id="panel4a-header"
                >
                <Typography>Links</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <div className={styles.editContents}>
                    <h1>Links</h1>
                    <h2>Link Text Color</h2>
                    <HexColorPicker color={linkTextColor} onChange={e => setLinkTextColor(e.toUpperCase())} />
                    <TextField type="text" value={linkTextColor} onChange={e => standardizeColorInput(e.target.value, setLinkTextColor, linkTextColorRef)} className={styles.textField} size="small" variant="filled" />
                    <h2>Link Background Color</h2>
                    <HexColorPicker color={linkBackgroundColor} onChange={e => setLinkBackgroundColor(e.toUpperCase())} />
                    <TextField type="text" value={linkBackgroundColor} onChange={e => standardizeColorInput(e.target.value, setLinkBackgroundColor, linkBackgroundColorRef)} className={styles.textField} size="small" variant="filled" />
                    <h2>Live Notification Color</h2>
                    <HexColorPicker color={liveNotificationColor} onChange={e => setLiveNotificationColor(e.toUpperCase())} />
                    <TextField type="text" value={liveNotificationColor} onChange={e => standardizeColorInput(e.target.value, setLiveNotificationColor, liveNotificationColorRef)} className={styles.textField} size="small" variant="filled" />
                    <h2>Links</h2>
                    <ul className={styles.linkEditList}>
                        {links?.map((link, index) => {
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
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedAccordion === 'panel5'} onChange={handleAccordionChange('panel5')}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel5a-content"
                id="panel5a-header"
                >
                <Typography>Site/Domains</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={styles.editContents}>
                        <h1>Site/Domains</h1>
                        <h2>Live Sites</h2>
                        <a href={`${process.env.REACT_APP_HOSTED_BASE}/${site.subdomain}`} style={{color: themeObj.color}} target="_blank" rel="noreferrer">{process.env.REACT_APP_HOSTED_BASE}/{site.subdomain}</a>
                        <br/>
                        <a href={`${process.env.REACT_APP_HOSTED_BASE_SHORT}/${site.subdomain}`} style={{color: themeObj.color}} target="_blank" rel="noreferrer">{process.env.REACT_APP_HOSTED_BASE_SHORT}/{site.subdomain}</a>
                        <h2>Domains</h2>
                        <button onClick={openCheckDomainModal}>Add a domain</button>
                        {
                            domains.length ?
                                <>
                                    <ul className={styles.domainList}>
                                        {domains.map(data => {
                                            return <li key={data.domain} className={styles.domainListDomain}>
                                                <a href={`https://${data.domain}`} target="_blank" rel="noreferrer" style={{color: themeObj.color}}>{data.domain}</a>
                                                &nbsp;
                                                { data.isPointing ?
                                                    <FontAwesomeIcon icon={["fas", "check"]} color="lightgreen" />
                                                    :
                                                    <FontAwesomeIcon icon={["fas", "window-close"]} color="salmon" />
                                                }
                                                &nbsp;
                                                <button onClick={() => openDeleteDomainModal(data.domain)}>Delete</button>
                                                <br/>
                                                { data.isPointing ?
                                                    null
                                                    :
                                                    <div>CNAME: <br/>{data.cname}</div>
                                                }
                                            </li>
                                        })}
                                    </ul>
                                    <p>Reminder: make sure each domain has a<br/>"www" CNAME pointing at the CNAME listed under it.</p>
                                </>
                                
                            :
                            <div>You have no domains.</div>
                        }
                        
                    </div>
                </AccordionDetails>
            </Accordion>
        </>
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
            .delete(`${process.env.REACT_APP_API_BASE}/api/sites/siteId/${site._id}`, { withCredentials: true })
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
    }, [title, subtitle, headerImage, headerEmoji, links, backgroundImage, titlesColor, containerColor, containerGradient, bodyColor, bodyGradient, linkTextColor, linkBackgroundColor, liveNotificationColor, bodyAnimationStyle])

    const keyFramesStartEdit = `
        @keyframes single-site-move-right {
            0% {
                top: 200px;
                left: 0;
                right: 0;
            }

            100% {
                top: 160px;
                left: calc(100vw - 850px);
                right: 50px;
            }
        }
    `

    const singleSiteStyle = {
        top: isEditing ? '160px': '200px',
        position: 'absolute',
        marginLeft: 'auto',
        marginRight: 'auto',
        left: isEditing ? 'calc(100vw - 850px)' : 0,
        right: isEditing ? '50px' :  0
    }

    const keyFramesEndEdit = `
        @keyframes single-site-move-left {
            0% {
                top: 160px;
                left: calc(100vw - 850px);
                right: 50px;
            }

            100% {
                top: 200px;
                left: 0;
                right: 0;
            }
        }
    `

    const onMouseEnter = (index) => {
        setHoveredLinkIndex(index);
    }

    const onMouseLeave = () => {
        setHoveredLinkIndex(null);
    }

    const getDisplayContents = (thisTitle, thisSubtitle, thisHeaderImage, theseLinks, titlesColor, thisContainerColor, thisContainerGradient, thisBodyColor, thisBodyGradient, thisLinkTextColor, thisLinkBackgroundColor, thisLiveNotificationColor, thisBodyAnimationStyle) => {
        document.body.style.backgroundColor = thisBodyColor;
        document.body.style.backgroundImage = thisBodyGradient;
        
        return <div className={styles.singleSiteWrapper} style={{ justifyContent: isEditing ? 'flex-end' : 'center', paddingRight: isEditing ? '50px': 0 }}>
            {thisBodyAnimationStyle && !isEditing && memoizedParticles}
             <style children={isEditing ? keyFramesStartEdit : keyFramesEndEdit} />
             <div className={styles.singleSiteContainer} style={{ backgroundColor: !thisContainerGradient && thisContainerColor, backgroundImage: thisContainerGradient, ...singleSiteStyle, animationName: hasEditButtonBeenClicked && (isEditing ? 'single-site-move-right' : 'single-site-move-left'), animationDuration: '2s' }}>
                <Prompt when={isDirty} />
                <div className={styles.editButton} style={{color: editButtonColor}}>
                    { isEditing || !isEditButtonVisible ? 
                        null
                        : 
                        <FontAwesomeIcon icon={["far", "edit"]} size="3x" onClick={() => {
                            setIsEditing(true)
                            setHasEditButtonBeenClicked(true);
                        }} />
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
                            width="200" height="200"
                        />
                }
                <h1 className={styles.singleTitle} style={{ color: titlesColor }}>{thisTitle}</h1>
                <h3 className={styles.singleSubtitle} style={{ color: titlesColor }}>{thisSubtitle}</h3>
                {links ?
                    <ul className={styles.linksList}>
                        {theseLinks?.map((link, i) => {
                            const hoverStyle = {color: thisLinkBackgroundColor, background: thisLinkTextColor};
                            const nonHoverStyle = {color: thisLinkTextColor, background: thisLinkBackgroundColor};

                            return <a href={link.href.startsWith("http") ? link.href : "https://" + link.href} 
                                target="_blank" rel="noreferrer" className={styles.individualLink} 
                                style={{ color: hoveredLinkIndex === i ? hoverStyle.color : nonHoverStyle.color, background: hoveredLinkIndex === i ? hoverStyle.background: nonHoverStyle.background }}  
                                key={i} onMouseEnter={() => onMouseEnter(i)} onMouseLeave={onMouseLeave}
                            >
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

    const keyFramesStartEditTray = `
        @keyframes edit-tray-move-right {
            0% {
                left: -600px;
            }

            100% {
                left: 0;
            }
        }
    `

    const editTrayStyle = {
        left: isEditing ? 0 : '-600px',
    }

    const keyFramesEndEditTray = `
        @keyframes edit-tray-move-left {
            0% {
                left: 0;
            }

            100% {
                left: -600px;
            }
        }
    `

    return (
        <>
            <ThemeProvider theme={theme === 'light' ? muiLightTheme : muiDarkTheme}>
                <style children={isEditing ? keyFramesStartEditTray : keyFramesEndEditTray} />
                <div className={styles.editTray} style={{...editTrayStyle, animationName: hasEditButtonBeenClicked && (isEditing ? 'edit-tray-move-right' : 'edit-tray-move-left'), animationDuration: '2s', backgroundColor: themeObj.editTrayBackground}}>
                    <div className={styles.saveAndCancelButtons}>
                        <FontAwesomeIcon icon={["far", "save"]} size="3x" onClick={onSave} color="lightgreen" />
                        <FontAwesomeIcon icon={["far", "window-close"]} size="3x" onClick={onCancel} color="salmon" />
                    </div>
                    { getEditContents() }
                </div>

                { isEditing ?
                    getDisplayContents(title, subtitle, headerImage?.base64 || headerImage?.url, links, titlesColor, containerColor, containerGradient, bodyColor, bodyGradient, linkTextColor, linkBackgroundColor, liveNotificationColor, bodyAnimationStyle)
                    :
                    getDisplayContents(site.title, site.subtitle, site.headerImage?.base64 || site.headerImage?.url, site.links, site.titlesColor, site.containerColor, site.containerGradient, site.bodyColor, site.bodyGradient, site.linkTextColor, site.linkBackgroundColor, site.liveNotificationColor, site.bodyAnimationStyle)
                }
                { isPexelsModalShowing ?
                    <>
                        <div className={styles.blocker} onClick={() => setIsPexelsModalShowing(false)} />
                        <div className={styles.pexelsModal}>
                            <div className={styles.closeButton} onClick={() => setIsPexelsModalShowing(false)}>+</div>
                            <span>Find and select a photo for your {modalOpenedWith} image from <a href="https://www.pexels.com">Pexels</a></span>
                            <form className={styles.pexelsSearch} onSubmit={fetchPexels}>
                                <TextField type="text" value={query} placeholder="Search" onChange={e => setQuery(e.target.value)} className={styles.textField} size="small" variant="filled" />
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
                            <TextField type="text" name="domainToAdd" value={domainToAdd} onChange={(e) => setDomainToAdd(e.target.value)} placeholder="Domain" className={styles.textField} size="small" variant="filled" />
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
                            <p>Please add a "www" CNAME at your registrar<br/>that points at our server: <br/> {currentDomainCname}</p>
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
            </ThemeProvider>
        </>
    )
}

export default SingleSite;