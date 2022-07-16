import React, { useEffect } from 'react';
import CreateSite from './createSite';

const LinkPageBuilder = () => {
  useEffect(() => {
    document.body.style.backgroundImage = null;
  }, []);
    
  return (
    <div>
      <CreateSite />
    </div>
  );
};

export default LinkPageBuilder;