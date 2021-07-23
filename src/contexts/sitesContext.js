import React, { createContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const SitesContext = createContext();

const SitesContextProvider = (props) => {
    const [site, setSite] = useState({});
    const [sites, setSites] = useState([]);

    const updateSite = async siteId => {
        axios
            .get(`http://localhost:4000/sites/${siteId}`)
            .then(res => {
                setSite(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    const updateSites = () => {
        axios
            .get('http://localhost:4000/sites')
            .then(res => {
                setSites(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    return (
        <SitesContext.Provider value={{ site, sites, updateSite, updateSites }} >
            {props.children}
        </SitesContext.Provider>
    )
}

export default SitesContextProvider;