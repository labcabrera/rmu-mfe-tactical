import React from 'react';

const HealthBar = ({ currentHP, maxHP }) => {

    const percent = (currentHP / maxHP) * 100;

    const getColor = () => {
        const r = Math.min(255, Math.floor((255 * (100 - percent)) / 100));
        const g = Math.min(255, Math.floor((255 * percent) / 100));
        return `rgb(${r}, ${g}, 50)`;
    };

    const barStyle = {
        width: `${percent}%`,
        height: '100%',
        backgroundColor: getColor(),
        transition: 'width 0.5s ease, background-color 0.5s ease',
    };

    return (
        <div style={{ border: '1px solid #000', width: '100%', height: '30px', backgroundColor: '#ddd' }}>
            <div style={barStyle}></div>
        </div>
    );
};

export default HealthBar;