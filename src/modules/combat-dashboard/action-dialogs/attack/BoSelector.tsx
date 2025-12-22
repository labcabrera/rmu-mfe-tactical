import React, { FC } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Box, IconButton, Slider, Stack, Typography } from '@mui/material';

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  integer?: boolean;
  disabled?: boolean;
};

const BoSelector: FC<Props> = ({ value, onChange, min = 0, max, integer = true, disabled = false }) => {
  const safeMax = Math.max(min, max ?? min);
  const current = value === null || value === undefined ? min : Math.max(min, Math.min(value, safeMax));

  // generate marks every 10 units between 0 (or min) and safeMax, always include safeMax
  const start = Math.max(0, min);
  const marks: { value: number; label?: string }[] = [];
  for (let v = start; v <= safeMax - 9; v += 10) {
    marks.push({ value: v, label: String(v) });
  }
  if (marks.length === 0 || marks[marks.length - 1].value !== safeMax) {
    marks.push({ value: safeMax, label: String(safeMax) });
  }

  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        Used BO
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
          <Slider
            value={current}
            min={min}
            max={safeMax}
            step={1}
            marks={marks}
            onChange={(_, v) => {
              const n = Array.isArray(v) ? v[0] : (v as number);
              onChange(integer ? Math.round(n) : n);
            }}
            disabled={disabled}
            aria-label="bo-slider"
            getAriaValueText={(value: number) => `${value}`}
            valueLabelDisplay="on"
            sx={{ width: '100%' }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 0.5,
            width: 72,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              const next = Math.max(min, current - 1);
              onChange(integer ? Math.round(next) : next);
            }}
            disabled={disabled || current <= min}
            aria-label="decrement-bo"
          >
            <RemoveCircleIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              const next = Math.min(safeMax, current + 1);
              onChange(integer ? Math.round(next) : next);
            }}
            disabled={disabled || current >= safeMax}
            aria-label="increment-bo"
          >
            <AddCircleIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </>
  );
};

export default BoSelector;
