import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { lightTheme, darkTheme } from '../constants/themes';
import { toast } from 'react-toastify';

export const SitesContext = createContext();
const localTheme = localStorage.getItem("mostlinkTheme");

const SitesContextProvider = (props) => {
    const [site, setSite] = useState({});
    const [sites, setSites] = useState([]);
    const [jwtToken, setJwtToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [theme, setTheme] = useState(localTheme || "dark");
    const [themeObj, setThemeObj] = useState(localTheme === "light" ? lightTheme : darkTheme);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [email, setEmail] = useState("");
    const [withGoogle, setWithGoogle] = useState(false);
    const createSiteModalRef = useRef(null);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/api/users/`, { withCredentials: true })
            .then(res => {
                setEmail(res.data.email);
                setWithGoogle(res.data.google);
                setIsSubscribed(res.data.isSubscribed)
            })
            .catch(err => console.log(err));
    }, [])

    const fetchSite = async siteId => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/api/sites/siteId/${siteId}`, { withCredentials: true })
            .then(res => {
                setSite(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    const fetchSites = () => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/api/sites/byUserId`, { withCredentials: true })
            .then(res => {
                setSites(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    const toggleTheme = () => {
        if (theme === "dark") {
            setTheme("light");
            setThemeObj(lightTheme);
            localStorage.setItem("mostlinkTheme", "light");
        } else {
            setTheme("dark");
            setThemeObj(darkTheme);
            localStorage.setItem("mostlinkTheme", "dark");
        }
    }

    return (
        <SitesContext.Provider value={{ 
            site, 
            sites, 
            jwtToken, 
            userId, 
            theme, 
            themeObj,
            isSubscribed,
            createSiteModalRef,
            email,
            withGoogle,
            fetchSite, 
            fetchSites, 
            setJwtToken, 
            setUserId, 
            setTheme, 
            toggleTheme,
            setIsSubscribed
        }} >
            {props.children}
        </SitesContext.Provider>
    )
}

export default SitesContextProvider;