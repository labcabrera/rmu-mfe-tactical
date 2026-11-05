import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { formatBonus, NumberPadField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttack } from '../../../../api/action.dto';

/** Equal shares of the OB of a bolt, as the API splits it when no `obSplit` is sent (the first ones take the rest). */
export const equalBoltShares = (bo: number, targets: number): number[] => {
  if (bo <= 0 || targets <= 1) return Array.from({ length: targets }, () => bo);
  const share = Math.floor(bo / targets);
  const remainder = bo - share * targets;
  return Array.from({ length: targets }, (_, index) => share + (index < remainder ? 1 : 0));
};

/** A split by hand: one whole part from 0 per target, adding up to the OB of the bolt at most. */
export const boltSplitValid = (bo: number, split: number[], targets: number): boolean =>
  split.length >= targets &&
  split.slice(0, targets).every((value) => Number.isInteger(value) && value >= 0) &&
  split.slice(0, targets).reduce((sum, value) => sum + value, 0) <= Math.max(0, bo);

/**
 * OB of a bolt with several targets (workspace spec 077, Scope Skills, P9): the bolt splits its OB among them, in equal
 * parts unless the game master gives each target its part.
 */
const BoltSplitFields: FC<{
  bo: number;
  attacks: ActionAttack[];
  /** The parts by hand, in the order of the attacks; null for equal parts. */
  value: number[] | null;
  onChange: (value: number[] | null) => void;
  targetName: (actorId: string) => string;
}> = ({ bo, attacks, value, onChange, targetName }) => {
  const { t } = useTranslation();
  const equal = equalBoltShares(bo, attacks.length);
  // One part per attack, also when targets were added or removed since the parts were typed
  const shares = attacks.map((_, index) => (value ? (value[index] ?? 0) : equal[index]));
  const total = shares.reduce((sum, each) => sum + (each || 0), 0);
  const valid = value === null || boltSplitValid(bo, shares, attacks.length);
  return (
    <Stack spacing={1.5}>
      <Alert severity="info" variant="outlined">
        {t('spell-bolt-ob-split-help', { bo: formatBonus(bo), count: attacks.length })}
      </Alert>
      <FormControlLabel
        control={<Switch checked={value !== null} onChange={(e) => onChange(e.target.checked ? equal : null)} />}
        label={t('spell-bolt-ob-split-manual')}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
        {attacks.map((attack, index) => (
          <Box key={attack.attackName}>
            {value === null ? (
              <Typography variant="body2">
                {`${targetName(attack.modifiers.targetId)}: ${formatBonus(shares[index] ?? 0)}`}
              </Typography>
            ) : (
              <NumberPadField
                steps={[-10, -5, 5, 10]}
                label={targetName(attack.modifiers.targetId)}
                value={shares[index]}
                onChange={(part) => onChange(shares.map((each, i) => (i === index ? (part ?? 0) : each)))}
                min={0}
                max={bo}
                integer
                allowNegatives={false}
              />
            )}
          </Box>
        ))}
      </Box>
      {!valid && (
        <Typography variant="caption" color="error">
          {t('spell-bolt-ob-split-over', { total, bo })}
        </Typography>
      )}
    </Stack>
  );
};

export default BoltSplitFields;
