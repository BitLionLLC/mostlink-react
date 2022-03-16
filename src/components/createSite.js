import React, { useState, useContext, createRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SitesContext } from '../contexts/sitesContext';
import { useScreenshot } from 'use-react-screenshot'
import './createSite.css';

const CreateSite = () => {
    const ref = createRef(null);
    const [image, takeScreenshot] = useScreenshot();
    const getImage = () => takeScreenshot(ref.current);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");

    const { fetchSites } = useContext(SitesContext);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        getImage();
    }

    const createSite = (e) => {
        const links = [
            { href: "https://www.google.com", text: "Google", icon: "fab_google", id: 0 },
            { href: "https://www.youtube.com", text: "YouTube", icon: "fab_youtube", id: 1 },
            { href: "https://www.twitch.tv", text: "Twitch", icon: "fab_twitch", id: 2 }
        ];

        e.preventDefault();
        axios
            .post(`/sites`, {
                title,
                subtitle,
                screenshot: image,
                links,
                titlesColor: "#000000",
                containerColor: "#ADD8E6",
                linkTextColor: "#000000",
                linkBackgroundColor: "#FFFFFF"
            })
            .then(() => {
                setIsModalOpen(false);
                toast("Success", { type: "success" });
                setTitle("")
                setSubtitle("")
                fetchSites();
            })
            .catch(err => {
                toast(err, { type: "error" })
            })
    }

    return (
        <>
            <div className="create-site" onClick={toggleModal} ref={ref}>+</div>
            { isModalOpen ?
                <> 
                    <div className="blocker" onClick={toggleModal}></div>
                    <div className="create-site-modal">
                        <div className="close-button" onClick={toggleModal}>+</div>
                        <h1>Create a site</h1>
                        <form onSubmit={createSite} className="create-site-form">
                            <input type="text" className="create-input" value={title} name="title" onChange={e => setTitle(e.target.value)} placeholder="Site title" />
                            <input type="text" className="create-input" value={subtitle} name="subtitle" onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle" />
                            <button type="submit" className="create-button">Create</button>
                        </form>
                    </div>
                </>
            : null }
        </>
    )
}

export default CreateSite;