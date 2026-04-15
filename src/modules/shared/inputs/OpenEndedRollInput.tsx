/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { ClearButton, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';

const TOP_LIMIT = 96;
const BOTTOM_LIMIT = 5;

export type OpenEndedRollProps = {
  value?: string;
  gridColumns?: number;
  inputGridSize?: number;
  onChange: (result: number | null) => void;
};

const clamp = (n: number) => Math.min(100, Math.max(1, Math.floor(n)));

const OpenEndedRollInput: FC<OpenEndedRollProps> = ({ value, gridColumns = 12, inputGridSize = 2, onChange }) => {
  const [rolls, setRolls] = useState<Array<number | null>>(() => {
    if (value) {
      const v = parseInt(value, 10);
      if (!isNaN(v)) return [clamp(v)];
    }
    return [null];
  });

  useEffect(() => {
    if (!value) return;
    const v = parseInt(value, 10);
    if (isNaN(v)) return;
    if (v > BOTTOM_LIMIT && v < TOP_LIMIT) onChange(v);
  }, []);

  const finalizeIfDone = (currentRolls: Array<number | null>) => {
    if (currentRolls.length === 0) return;
    const first = currentRolls[0];
    if (first === null) return;
    // determine chain type
    if (first > BOTTOM_LIMIT && first < TOP_LIMIT) {
      onChange(first);
      return;
    }
    if (first >= TOP_LIMIT) {
      if (currentRolls.some((r) => r === null)) return;
      const last = currentRolls[currentRolls.length - 1] as number;
      if (last >= TOP_LIMIT) return; // still exploding
      const sum = currentRolls.reduce((s, r) => s + (r || 0), 0);
      onChange(sum);
      return;
    }
    // first <=5 negative chain
    if (first <= BOTTOM_LIMIT) {
      if (currentRolls.some((r, idx) => idx > 0 && r === null)) return;
      const last = currentRolls[currentRolls.length - 1] as number;
      if (last >= 95) return; // still exploding negatively
      // total = first - sum(subsequent)
      const rest = currentRolls.slice(1).reduce((s, r) => s + (r || 0), 0);
      onChange(first - rest);
      return;
    }
  };

  const handleValueChange = (index: number, parsed: number) => {
    setRolls((prev) => {
      const copy = prev ? prev.slice(0, index) : [];
      copy[index] = parsed;
      const first = copy[0];
      if (index === (prev ? prev.length - 1 : 0)) {
        if (first === null) {
          if (copy[0] === null) return copy;
        }
        if (copy.length === 1 && parsed !== null) {
          if (parsed >= TOP_LIMIT || parsed <= BOTTOM_LIMIT) {
            copy.push(null);
            return copy;
          }
          // done
          return copy;
        }
        // if first roll started chain positive
        if (first !== null && first >= 95) {
          // if parsed is null -> keep
          if (parsed === null) return copy;
          if (parsed >= TOP_LIMIT) {
            copy.push(null);
            return copy;
          }
          return copy;
        }
        if (first !== null && first <= 5) {
          if (parsed === null) return copy;
          if (parsed > TOP_LIMIT) {
            copy.push(null);
            return copy;
          }
          return copy;
        }
      }
      return copy;
    });
  };

  const onClear = () => {
    setRolls([null]);
    onChange(null);
  };

  useEffect(() => {
    finalizeIfDone(rolls);
  }, [rolls]);

  return (
    <Grid container spacing={1} columns={gridColumns} alignItems="center">
      <Grid>Open-ended roll</Grid>
      {rolls.map((r, idx) => (
        <Grid size={inputGridSize} key={idx}>
          <NumericInput label={`Roll ${idx + 1}`} value={r} onChange={(e) => handleValueChange(idx, e!)} />
        </Grid>
      ))}
      <Grid>
        <ClearButton onClick={onClear} />
      </Grid>
    </Grid>
  );
};

export default OpenEndedRollInput;
