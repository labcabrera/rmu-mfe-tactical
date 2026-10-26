import React, { ComponentProps, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { formatBonus, RollBreakdown, SpellEffectList } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionSpell, SpellCastResult } from '../../../../api/action.dto';

const RESULT_SEVERITY: Record<SpellCastResult, 'success' | 'info' | 'error'> = {
  success: 'success',
  'no-effect': 'info',
  failure: 'error',
};

/**
 * Outcome of a cast: the Spellcasting Roll with its breakdown, the spell failure result (Spell Law Tables 4-4, as
 * text), the resistance rolls of the targets, the spell's effects and the power points it took.
 */
const SpellResult: FC<{ spell: ActionSpell }> = ({ spell }) => {
  const { t } = useTranslation();
  if (!spell.roll || !spell.result) return null;
  const effects = spell.spell.effects as ComponentProps<typeof SpellEffectList>['effects'];
  return (
    <Stack spacing={2}>
      <RollBreakdown modifiers={spell.roll.modifiers} roll={spell.roll.roll} total={spell.roll.totalRoll} totalLabel={t('spell-scr')} />
      <Alert severity={RESULT_SEVERITY[spell.result]}>{t(`spell-result-${spell.result}`)}</Alert>
      {spell.failure && (
        <Box>
          <Typography variant="subtitle2">
            {`${t('spell-failure')} (${t(spell.failure.realm)}): ${spell.failure.roll} ${formatBonus(spell.failure.modifier)} = ${spell.failure.total}`}
          </Typography>
          <Typography variant="body2" sx={{ my: 0.5 }}>
            {spell.failure.text}
          </Typography>
          <Chip size="small" label={t(`spell-failure-pp-${spell.failure.suggestedPp}`)} />
        </Box>
      )}
      {(spell.targets ?? []).length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{t('spell-resistance-rolls')}</Typography>
          {spell.targets!.map((target) => (
            <Stack key={target.actorId} direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {target.actorName ?? target.actorId}
              </Typography>
              {target.rolled ? (
                <Typography variant="body2" color="text.secondary">
                  {`${target.total} / ${target.required}`}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('spell-willing')}
                </Typography>
              )}
              <Chip
                size="small"
                color={target.resisted ? 'default' : 'warning'}
                label={target.resisted ? t('spell-resisted') : t('spell-affected', { failure: target.failure })}
              />
            </Stack>
          ))}
        </Stack>
      )}
      {spell.result === 'success' && effects && effects.length > 0 && <SpellEffectList effects={effects} />}
      {spell.powerPointsSpent !== null && spell.powerPointsSpent !== undefined && (
        <Typography variant="body2">{t('spell-power-points-spent', { count: spell.powerPointsSpent })}</Typography>
      )}
    </Stack>
  );
};

export default SpellResult;
