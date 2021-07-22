import React from 'react';
import LinkPageBuilder from './linkPageBuilder';
import SitesList from './sitesList';
import { ToastContainer } from 'react-toastify';

const Home = () => {
    return (
        <div className="App">
            <h1>A really cool link page builder</h1>
            <LinkPageBuilder />
            <ToastContainer position="top-right" autoClose={5000} />
            <SitesList />
        </div>
    )
}

export default Home;