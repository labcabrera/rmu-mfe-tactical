import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';

/**
 * How an attack splits the OB of its weapon (workspace spec 085, 2.2): a bar with the OB it spends and what it leaves,
 * shortcuts to spend all or half of it, and what the round leaves to parry, in amber when nothing is left and enemies
 * still attack the actor.
 */
const ObBudgetBar: FC<{
  used: number;
  max: number;
  /** What the actor keeps for the rest of the round and to parry, after every attack of this action. */
  reserve: number | null;
  /** Enemies still attack the actor this round: a reserve of 0 leaves it without a parry. */
  threatened?: boolean;
  onChange: (bo: number) => void;
}> = ({ used, max, reserve, threatened = false, onChange }) => {
  const { t } = useTranslation();
  const share = max > 0 ? Math.min(100, Math.max(0, (used / max) * 100)) : 0;
  const warn = reserve === 0 && threatened;
  return (
    <Stack spacing={0.75}>
      <Box
        role="meter"
        aria-label={t('ob-budget')}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        sx={(theme) => ({
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.text.primary, 0.12),
        })}
      >
        <Box sx={{ width: `${share}%`, bgcolor: 'primary.main', transition: 'width 150ms' }} />
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>
          {t('ob-budget-split', { used, left: Math.max(0, max - used), max })}
        </Typography>
        <Button size="small" onClick={() => onChange(max)} disabled={used === max}>
          {t('ob-all')}
        </Button>
        <Button size="small" onClick={() => onChange(Math.floor(max / 2))} disabled={used === Math.floor(max / 2)}>
          {t('ob-half')}
        </Button>
      </Stack>
      {reserve !== null && (
        <Typography
          variant="caption"
          color={warn ? 'warning.main' : 'text.secondary'}
          sx={{ fontWeight: warn ? 600 : 400 }}
        >
          {t(warn ? 'ob-reserve-none-threatened' : 'ob-reserve', { value: reserve })}
        </Typography>
      )}
    </Stack>
  );
};

export default ObBudgetBar;
