import React, { useEffect } from 'react';
import CreateSite from './createSite';
import axios from 'axios';

const LinkPageBuilder = () => {
    return (
        <div>
            Link Page Builder
            <CreateSite />
        </div>
    )
}

export default LinkPageBuilder;