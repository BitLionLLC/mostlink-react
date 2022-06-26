import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SitesContext } from '../contexts/sitesContext';
import TextField from '@mui/material/TextField';
import { Portal } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { muiDarkTheme, muiLightTheme } from '../constants/themes';

import styles from './createSite.module.css';

const CreateSite = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [isSubdomainValid, setIsSubdomainValid] = useState(true);

    const { fetchSites, themeObj, isSubscribed, sites, theme, createSiteModalRef } = useContext(SitesContext);

    useEffect(() => {
        if (!subdomain) {
            setIsSubdomainValid(true);
        }

        const delayDebounceFn = setTimeout(() => {
            subdomain && axios
                .get(`${process.env.REACT_APP_API_BASE}/api/sites/register-subdomain/${subdomain}`, { withCredentials: true })
                .then(() => setIsSubdomainValid(true))
                .catch(() => setIsSubdomainValid(false))
        }, 1000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [subdomain])

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    }

    const createSite = (e) => {
        const links = [
            { href: "https://www.google.com", text: "Google", icon: "fab_google", id: 0 },
            { href: "https://www.youtube.com", text: "YouTube", icon: "fab_youtube", id: 1 },
            { href: "https://www.twitch.tv", text: "Twitch", icon: "fab_twitch", id: 2 }
        ];

        e.preventDefault();
        isSubdomainValid && axios
            .post(`${process.env.REACT_APP_API_BASE}/api/sites`, {
                title,
                subtitle,
                links,
                subdomain,
                titlesColor: "#000000",
                containerColor: "#ADD8E6",
                linkTextColor: "#000000",
                linkBackgroundColor: "#FFFFFF",
                bodyColor: "#2E8B57"
            }, { withCredentials: true })
            .then(() => {
                setIsModalOpen(false);
                toast("Site created!", { type: "success" });
                setTitle("")
                setSubtitle("")
                setSubdomain("");
                fetchSites();
            })
            .catch(err => {
                toast(err, { type: "error" })
            })
    }

    return (
        <>
            <button 
                className={styles[props.className] || styles.createSite} 
                onClick={toggleModal} 
                style={{color: themeObj.accentColor, backgroundColor: themeObj.bodyColor}}
                disabled={!isSubscribed && sites.length > 2 && false} // TODO: remove both of these AND conditions when out of beta
                title={!isSubscribed && sites.length > 2 && false ? 'Subscribe to Premium to add more sites' : null}>
                    +
            </button>
            { isModalOpen ?
                <> 
                    <div className={styles.blocker} onClick={toggleModal}></div>
                    <Portal container={createSiteModalRef.current}>
                        <div className={styles.createSiteModal}>
                            <div className={styles.closeButton} onClick={toggleModal}>+</div>
                            <h1>Create a site</h1>
                            <ThemeProvider theme={theme === 'light' ? muiLightTheme : muiDarkTheme}>
                                <form onSubmit={createSite} className={styles.createSiteForm}>
                                    <TextField type="text" className={styles.textField} value={title} name="title" onChange={e => setTitle(e.target.value)} placeholder="Site title" variant="filled" size="small" />
                                    <TextField type="text" className={styles.textField} value={subtitle} name="subtitle" onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle" variant="filled" size="small"/>
                                    <div className={styles.siteAndPath}>www.mostlink.io/<TextField type="text" className={styles.textField} value={subdomain} name="subdomain" onChange={e => setSubdomain(e.target.value)} placeholder="path" variant="filled" size="small" /></div>
                                    {subdomain && !isSubdomainValid && <div className={styles.errorText}>That subdomain is taken. Please choose another.</div>}
                                    <button 
                                        type="submit" 
                                        className={styles.createButton} 
                                        disabled={!title || !subtitle || !subdomain || !isSubdomainValid}>
                                            Create
                                    </button>
                                </form>
                            </ThemeProvider>
                        </div>
                    </Portal>
                </>
            : null }
        </>
    )
}

export default CreateSite;