import React, { FC } from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

const TextCard: FC<{
  value: string;
  subtitle: string;
  image: string;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  grayscale?: number;
}> = ({ value, subtitle, image, maxWidth = 250, minWidth = 250, height = 70, imageSize = 70, grayscale = 0.5 }) => {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: { maxWidth },
        minWidth: { minWidth },
        height: { height },
      }}
    >
      <CardMedia
        component="img"
        image={image}
        alt={subtitle}
        sx={{ width: imageSize, height: imageSize, objectFit: 'cover', filter: `grayscale(${value ? grayscale : 1})` }}
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
        <Typography
          component="div"
          variant="h6"
          sx={{
            mt: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {value ? value : '...'}
        </Typography>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            fontSize: '1rem',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TextCard;
