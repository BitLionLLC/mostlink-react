import React, { createContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const SitesContext = createContext();

const SitesContextProvider = (props) => {
    const [sites, setSites] = useState([]);

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
        <SitesContext.Provider value={{sites, updateSites}} >
            {props.children}
        </SitesContext.Provider>
    )
}

export default SitesContextProvider;