import React, { FC } from 'react';
import { Card, CardContent, CardMedia } from '@mui/material';

const ImageCard: FC<{
  image: string;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  disabled?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({
  image,
  children,
  onClick,
  maxWidth = 400,
  minWidth = 400,
  height = 100,
  imageSize = 100,
  disabled = false,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={({ palette }) => ({
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: maxWidth,
        minWidth: minWidth,
        height: height,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, background 0.2s',
        backgroundColor: disabled ? palette.background.default : palette.action.disabledBackground,
        '&:hover': {
          boxShadow: 6,
          backgroundColor: 'action.hover',
        },
      })}
    >
      <CardMedia
        component="img"
        image={image}
        alt="image"
        sx={{ width: imageSize, height: imageSize, objectFit: 'cover', filter: disabled ? 'grayscale(1)' : 'none' }}
      />
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ml: 2,
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default ImageCard;
