import React, { FC, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

export type ResultValue = { label: string; value: ReactNode; tone?: 'positive' | 'negative' };

/** Results of a resolved action as a grid of big values with their label. */
const ResultValues: FC<{ values: ResultValue[] }> = ({ values }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1.5 }}>
    {values.map((item) => (
      <Box key={item.label}>
        <Typography
          variant="h6"
          component="div"
          sx={{ lineHeight: 1.2 }}
          color={item.tone === 'negative' ? 'error.main' : item.tone === 'positive' ? 'success.main' : 'text.primary'}
        >
          {item.value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default ResultValues;
