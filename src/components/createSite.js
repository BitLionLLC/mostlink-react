import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SitesContext } from '../contexts/sitesContext';
import './createSite.css';

const CreateSite = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");

    const { updateSites } = useContext(SitesContext);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    }

    const createSite = (e) => {
        e.preventDefault();
        axios
            .post('http://localhost:4000/sites', {
                title
            })
            .then(res => {
                setIsModalOpen(false);
                toast("Success", { type: "success" });
                updateSites();
            })
            .catch(err => {
                toast(err, { type: "error" })
            })
    }

    return (
        <>
            <div className="create-site" onClick={toggleModal}>+</div>
            { isModalOpen ? 
                <div className="create-site-modal">
                    <div className="blocker"></div>
                    <div className="close-button" onClick={toggleModal}>+</div>
                    <h1>Create a site</h1>
                    <form onSubmit={createSite}>
                        <input type="text" value={title} name="title" onChange={e => setTitle(e.target.value)} placeholder="Site title" />
                        <button type="submit">Create</button>
                    </form>
                </div>
        
            : null }
        </>
    )
}

export default CreateSite;