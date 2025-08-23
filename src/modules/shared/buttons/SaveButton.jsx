import React from 'react';

import StyledIconButton from './StyledIconButton';


const SaveButton = ({ onClick, size, disabled = false }) => {

    return (
        <StyledIconButton
            disabled={disabled}
            onClick={onClick}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}>
            <img
                src='/static/images/generic/save.png'
                alt='Save'
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
        </StyledIconButton>
    );
};

export default SaveButton;