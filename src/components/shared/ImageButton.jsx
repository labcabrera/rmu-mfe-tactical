import React from 'react';

import Tooltip from '@mui/material/Tooltip';

const ImageButton = ({ imagenSrc, onClick, altText, width, height, disabled }) => {
    return (
        <Tooltip title={altText}>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`image-button ${disabled ? 'disabled' : ''}`}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'inline-block',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
            >
                <img
                    src={imagenSrc}
                    alt={altText}
                    style={{
                        width: `${width ? width : 50}px`,
                        height: `${height ? height : 50}px`,
                        transition: 'filter 0.2s ease'
                    }}
                    className={'image-button-image'}
                />
            </button>
        </Tooltip>
    );
};

export default ImageButton;