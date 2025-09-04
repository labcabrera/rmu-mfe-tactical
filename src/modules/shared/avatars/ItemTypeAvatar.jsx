/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';

const ItemTypeAvatar = ({ itemType, size = 80, variant }) => {
  return <Avatar alt={itemType} variant={variant} sx={{ width: size, height: size }} src={`/static/images/items/${itemType}.png`} />;
};

export default ItemTypeAvatar;
