import React, { useEffect } from 'react';
import LinkPageBuilder from './linkPageBuilder';
import SitesList from './sitesList';
import './home.css';

const Home = () => {
    useEffect(() => {
        document.body.style.backgroundImage = null;
    }, [])

    return (
        <div className="App">
            <LinkPageBuilder />
            <SitesList />
        </div>
    )
}

export default Home;