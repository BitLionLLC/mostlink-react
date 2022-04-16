import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/home';
import SitesContextProvider from './contexts/sitesContext';
import SingleSite from './components/singleSite';
import Account from './components/account/account';
import Login from './components/account/login';
import Register from './components/account/register';
import Header from './components/header';
import Landing from './components/landing';
import Pricing from './components/pricing';
import { ToastContainer } from 'react-toastify';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    fetch(`/users/csrf-token`)
      .then(async res => {
        const json = await res.json();
        axios.defaults.headers['X-CSRF-Token'] = json.csrfToken;
      })
      .catch(err => {
        console.log(err);
      })
  })

  return (
    <SitesContextProvider>
      <ToastContainer position="top-right" autoClose={5000} />
      <Router>
        <Header />
        <Route path="/" exact>
          <Landing />
        </Route>
        <Route path="/home">
          <Home />
        </Route>
        <Route path="/site/:id">
          <SingleSite />
        </Route>
        <Route path="/account" exact>
          <Account />
        </Route>
        <Route path="/account/register">
          <Register />
        </Route>
        <Route path="/account/login">
          <Login />
        </Route>
        <Route path="/pricing">
          <Pricing />
        </Route>
      </Router>
    </SitesContextProvider>
  );
}

library.add(fab, far, fas);

export default App;
