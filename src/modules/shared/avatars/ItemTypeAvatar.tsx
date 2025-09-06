import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import type { AvatarProps } from '@mui/material/Avatar';

type ItemTypeAvatarProps = {
  itemType: string;
  size?: number;
  variant?: AvatarProps['variant'];
};

const ItemTypeAvatar: FC<ItemTypeAvatarProps> = ({ itemType, size = 80, variant }) => {
  return <Avatar alt={itemType} variant={variant} sx={{ width: size, height: size }} src={`/static/images/items/${itemType}.png`} />;
};

export default ItemTypeAvatar;
