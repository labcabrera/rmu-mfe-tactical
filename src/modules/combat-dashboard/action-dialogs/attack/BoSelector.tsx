import React, { FC } from 'react';
import { Box, Slider, Stack } from '@mui/material';
import { NumericInput } from '../../../shared/inputs/NumericInput';

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
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 160 }}>
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
          />
        </Box>
        <Box sx={{ width: 100 }}>
          <NumericInput
            value={current}
            onChange={(v) => {
              const n = v === null ? min : v;
              const clipped = Math.max(min, Math.min(n, safeMax));
              onChange(integer ? Math.round(clipped) : clipped);
            }}
            integer={integer}
            min={min}
            max={safeMax}
            disabled={disabled}
          />
        </Box>
      </Stack>
    </>
  );
};

export default BoSelector;
