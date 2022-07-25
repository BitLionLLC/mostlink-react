import React, { useState, useContext } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SitesContext } from '../../contexts/sitesContext';
import { Link } from 'react-router-dom';

import styles from './faqs.module.css';

const FAQs = () => {
  const { themeObj } = useContext(SitesContext);
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  const handleAccordionChange = panel => (e, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <div className={styles.faqs} style={{ backgroundColor: themeObj.landingCardBackground }}>
      <div id="faqs" className={styles.anchor} />
      <h1>FAQ's</h1>
      <Accordion expanded={expandedAccordion === 'panel0'} onChange={handleAccordionChange('panel0')} className={styles.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel0a-content"
          id="panel0a-header"
        >
          <Typography>Why do I need to make a site anyway?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>The idea of Mostlink is to create a single site with a URL you can share on all your social media profiles.
                        All your links with ways to get in touch with you, profiles on social platforms, streaming links, or stores that you're 
                        selling on can be housed in one location. If you need to get the word out there about your stream or business, this
                        is a fun and easy way to do just that!
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')} className={styles.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Do you have a free trial?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>We have completely free accounts that will remain free forever! 
                        The Premium accounts have more features, such as unlimited sites, custom domains and live Twitch notifications. 
                        Check out our <Link to="/pricing" style={{ color: themeObj.accentColor }}>Pricing page</Link> for more info.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')} className={styles.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>How do I set up an CNAME record with my registrar for custom domains?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Here are some links for popular registrars to get you started:</Typography>
          <Typography>
            <a href="https://support.google.com/a/answer/47283?hl=en" target="_blank" rel="noreferrer" style={{ color: themeObj.accentColor }}>Google Domains</a>
          </Typography>
          <Typography>
            <a href="https://www.name.com/support/articles/115004895548-Adding-a-CNAME-Record" target="_blank" rel="noreferrer" style={{ color: themeObj.accentColor }}>Name.com</a>
          </Typography>
          <Typography>
            <a href="https://www.ipage.com/help/article/dns-management-how-to-update-cname-aliases" target="_blank" rel="noreferrer" style={{ color: themeObj.accentColor }}>iPage</a>
          </Typography>
          <Typography>
            <a href="https://www.godaddy.com/help/add-a-cname-record-19236" target="_blank" rel="noreferrer" style={{ color: themeObj.accentColor }}>GoDaddy</a>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default FAQs;