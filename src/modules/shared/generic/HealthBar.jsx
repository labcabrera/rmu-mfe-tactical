/* eslint-disable react/prop-types */
import React from 'react';
import Stack from '@mui/material/Stack';

const HealthBar = ({ currentHP, maxHP }) => {
  const percent = (currentHP / maxHP) * 100;

  const getColor = () => {
    if (currentHP < 1) {
      return 'rgb(100, 250, 150)';
    }
    const r = Math.min(255, Math.floor((100 * (100 - percent)) / 100));
    const g = Math.min(255, Math.floor((100 * percent) / 100));
    return `rgb(${r}, ${g}, 0)`;
  };

  const barStyle = {
    width: `${percent}%`,
    height: '100%',
    backgroundColor: getColor(),
    transition: 'width 0.5s ease, background-color 0.5s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff', // Color del texto dentro de la barra
    fontWeight: 'bold',
  };

  const containerStyle = {
    border: '1px solid #000',
    width: '100%',
    height: '40px', // Altura de la barra de vida
    backgroundColor: '#ddd', // Color de fondo cuando la barra no está llena
    position: 'relative', // Para que el texto esté alineado correctamente
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <div style={containerStyle}>
          <div style={barStyle}></div>
        </div>
        <div>
          {currentHP}/{maxHP}
        </div>
      </Stack>
    </>
  );
};

export default HealthBar;
