/* eslint-disable react/prop-types */
import React from 'react';
import AdjustIcon from '@mui/icons-material/Adjust';
import Rating from '@mui/material/Rating';

const ActionPointSelector = ({ value, min, max, defaultValue, onChange }) => {
  const handleChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > min) {
      onChange(value);
    } else {
      onChange(min);
    }
  };

  return (
    <Rating
      name="size-large"
      value={value}
      defaultValue={defaultValue}
      max={max}
      size="large"
      icon={<AdjustIcon fontSize="inherit" />}
      emptyIcon={<AdjustIcon fontSize="inherit" />}
      onChange={handleChange}
    />
  );
};

export default ActionPointSelector;
