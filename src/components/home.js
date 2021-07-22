import React from 'react';
import LinkPageBuilder from './linkPageBuilder';
import SitesList from './sitesList';
import { ToastContainer } from 'react-toastify';
import './home.css';

const Home = () => {
    return (
        <div className="App">
            <h1 className="home-title">Mostcard</h1>
            <LinkPageBuilder />
            <ToastContainer position="top-right" autoClose={5000} />
            <SitesList />
        </div>
    )
}

export default Home;