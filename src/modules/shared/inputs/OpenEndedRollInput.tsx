import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';

export type OpenEndedRollProps = {
  value?: string;
  onChange: (result: number) => void;
};

const clamp = (n: number) => Math.min(100, Math.max(1, Math.floor(n)));

const OpenEndedRollInput: FC<OpenEndedRollProps> = ({ value, onChange }) => {
  const [rolls, setRolls] = useState<Array<number | null>>(() => {
    if (value) {
      const v = parseInt(value, 10);
      if (!isNaN(v)) return [clamp(v)];
    }
    return [null];
  });

  useEffect(() => {
    // when component mounts and initial value provided, if it is final notify parent
    if (!value) return;
    const v = parseInt(value, 10);
    if (isNaN(v)) return;
    if (v >= 6 && v <= 94) onChange(v);
  }, []);

  const finalizeIfDone = (currentRolls: Array<number | null>) => {
    if (currentRolls.length === 0) return;
    const first = currentRolls[0];
    if (first === null) return;
    // determine chain type
    if (first >= 6 && first <= 94) {
      onChange(first);
      return;
    }
    if (first >= 95) {
      // need to ensure all entered rolls are numbers and last one is <95 to finalize
      if (currentRolls.some((r) => r === null)) return;
      const last = currentRolls[currentRolls.length - 1] as number;
      if (last >= 95) return; // still exploding
      const sum = currentRolls.reduce((s, r) => s + (r || 0), 0);
      onChange(sum);
      return;
    }
    // first <=5 negative chain
    if (first <= 5) {
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
        // edited last input
        if (first === null) {
          // nothing to decide yet
          if (copy[0] === null) return copy;
        }
        // if parsed indicates chain should continue, append null placeholder
        if (copy.length === 1 && parsed !== null) {
          if (parsed >= 95 || parsed <= 5) {
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
          if (parsed >= 95) {
            copy.push(null);
            return copy;
          }
          // parsed <95 => finalize
          return copy;
        }
        if (first !== null && first <= 5) {
          if (parsed === null) return copy;
          if (parsed > 95) {
            copy.push(null);
            return copy;
          }
          return copy;
        }
      }
      return copy;
    });
  };

  // effect to watch rolls and finalize when conditions met
  useEffect(() => {
    finalizeIfDone(rolls);
  }, [rolls]);

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid>Open-ended roll</Grid>
      {rolls.map((r, idx) => (
        <Grid size={2} key={idx}>
          <NumericInput label={`Roll ${idx + 1}`} value={r} onChange={(e) => handleValueChange(idx, e!)} />
        </Grid>
      ))}
    </Grid>
  );
};

export default OpenEndedRollInput;
