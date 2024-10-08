import React from 'react';
import { styled } from '@mui/system';

import IconButton from '@mui/material/IconButton';

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
    '& img': {
        filter: disabled ? 'grayscale(100%) opacity(0.3)' : 'none',
        transition: 'filter 0.3s ease-in-out',
    },
    '&:hover img': {
        filter: disabled ? 'grayscale(100%) opacity(0.5)' : 'brightness(1.4)',
    },
}));

export default StyledIconButton;