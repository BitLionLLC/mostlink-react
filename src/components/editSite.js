import React, { useState, useContext, useEffect } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import { Portal } from '@mui/material';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import axios from 'axios';

import styles from './editSite.module.css';

const EditSite = () => {
  const { fetchSites, createSiteModalRef, isEditModalOpen, setIsEditModalOpen, editModalOpenedWith } = useContext(SitesContext);

  const [title, setTitle] = useState(editModalOpenedWith.title || '');
  const [subtitle, setSubtitle] = useState(editModalOpenedWith.subtitle || '');
  const [subdomain, setSubdomain] = useState(editModalOpenedWith.subdomain || '');
  const [subdomainError, setSubdomainError] = useState('');
  const [isSubdomainValid, setIsSubdomainValid] = useState(true);
  const [suggestion, setSuggestion] = useState('');

  const WHITESPACE_REGEX = /\s/;
  const SUBDOMAIN_TAKEN_ERROR = 'That subdomain is taken. Please choose another one.';

  useEffect(() => {
    if (!subdomain) {
      setIsSubdomainValid(true);
    }

    const delayDebounceFn = setTimeout(() => {
      subdomain && subdomain !== editModalOpenedWith.subdomain && axios
        .get(`${process.env.REACT_APP_API_BASE}/api/sites/register-subdomain/${subdomain}`, { withCredentials: true })
        .then(() => {
          setIsSubdomainValid(true);
          setSubdomainError('');
        })
        .catch(err => {
          setIsSubdomainValid(false);
          setSuggestion(err.response.data.suggestion);
          setSubdomainError(SUBDOMAIN_TAKEN_ERROR);
        });
    }, 1000);
    
    if (subdomain?.match(WHITESPACE_REGEX)) {
      setSubdomainError('No spaces allowed.');
    } else {
      setSubdomainError('');
    }

    return () => clearTimeout(delayDebounceFn);
  }, [subdomain]);

  useEffect(() => {
    if (Object.keys(editModalOpenedWith).length) {
      setTitle(editModalOpenedWith.title || '');
      setSubtitle(editModalOpenedWith.subtitle || '');
      setSubdomain(editModalOpenedWith.subdomain || '');
    }
  }, [editModalOpenedWith]);

  const toggleModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      updateSite(e);
    }
  };

  const updateSite = (e) => {
    e.preventDefault();

    axios
      .put(`${process.env.REACT_APP_API_BASE}/api/sites/siteId/${editModalOpenedWith.id}`, {
        title,
        subtitle,
        subdomain,
      }, { withCredentials: true })
      .then(() => {
        setIsEditModalOpen(false);
        toast('Site updated!', { type: 'success' });
        setTitle('');
        setSubtitle('');
        setSubdomain('');
        fetchSites();
      })
      .catch(err => {
        toast(err.response.data.error, { type: 'error' });
      });
  };

  const onEscKey = e => {
    if (e.key === 'Escape') {
      setIsEditModalOpen(false);
    }
  };

  return (
    <div onKeyDown={onEscKey} tabIndex="0">
      { isEditModalOpen ?
        <div> 
          <div className={styles.blocker} onClick={toggleModal}></div>
          <Portal container={createSiteModalRef.current}>
            <div className={styles.editSiteModal} onKeyDown={onEscKey} tabIndex="0">
              <div className={styles.closeButton} onClick={toggleModal}>+</div>
              <h1>Edit site</h1>
              <form onSubmit={updateSite} className={styles.editSiteForm} onKeyDown={onKeyDown}>
                <TextField type="text" className={styles.textField} value={title} name="title" onChange={e => setTitle(e.target.value)} placeholder="Site title" variant="filled" size="small" />
                <TextField type="text" className={styles.textField} value={subtitle} name="subtitle" onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle" variant="filled" size="small"/>
                <div className={styles.siteAndPath}>
                  <TextField type="text" className={styles.textField} value={subdomain} name="subdomain" 
                    onChange={e => setSubdomain(e.target.value)} placeholder="subdomain" variant="filled" size="small" 
                    error={!isSubdomainValid || subdomainError} helperText={subdomainError} />.mostlink.io
                </div>
                {subdomain && subdomainError === SUBDOMAIN_TAKEN_ERROR && <div onClick={() => setSubdomain(suggestion)} className={styles.suggestion}>How about {suggestion}?</div>}
                <button 
                  type="submit" 
                  className={styles.updateButton} 
                  disabled={!title || !subtitle || !subdomain || !isSubdomainValid || subdomainError}>
                                            Update
                </button>
              </form>
            </div>
          </Portal>
        </div>
        : null }
    </div>
  );
};

export default EditSite;