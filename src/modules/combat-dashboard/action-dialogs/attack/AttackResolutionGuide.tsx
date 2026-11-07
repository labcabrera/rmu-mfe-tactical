import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { EffectList, Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action.dto';

/**
 * What the attack will do to its target once applied (workspace spec 085, 2.6): the damage, and how the hit and the
 * criticals add up to it; the target's hit points before and after; the effects, most severe first; and the text of
 * each critical or of the fumble.
 */
export const AttackResultSummary: FC<{
  attack: ActionAttack;
  targetName?: string;
  /** The texts of the criticals: left out in the rolls step, whose critical cards already show them. */
  withTexts?: boolean;
}> = ({ attack, targetName, withTexts = true }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const results = attack.results;
  if (!results || (attack.status !== 'pending_apply' && attack.status !== 'completed')) return null;

  const criticals = results.criticals ?? [];
  const hitDamage = results.attackTableEntry?.damage ?? 0;
  const criticalDamage = criticals.reduce((sum, critical) => sum + (critical.result?.damage ?? 0), 0);
  const damage = hitDamage + criticalDamage;
  const effects = criticals.flatMap((critical) => critical.result?.effects ?? []);
  const fumble = results.fumble;
  // Beside the fumble card (rolls step) the summary would only repeat its chips.
  if (fumble && !withTexts) return null;
  const texts = fumble
    ? [fumble.text].filter((text): text is string => !!text)
    : criticals.map((critical) => critical.result?.text).filter((text): text is string => !!text);

  // Computed here: once applied the damage is already in the target's hit points
  const target = actorRounds?.find((ar) => ar.actorId === attack.modifiers.targetId);
  const hp = target?.hp;
  const applied = attack.status === 'completed';
  const hpBefore = hp ? (applied ? Math.min(hp.max, hp.current + damage) : hp.current) : undefined;
  const hpAfter = hp ? (applied ? hp.current : hp.current - damage) : undefined;

  return (
    <Panel
      variant="outlined"
      dense
      title={fumble ? t('fumble-result-title') : t('attack-result-title', { target: targetName ?? t('target') })}
    >
      <Stack spacing={1}>
        {!fumble && (
          <Box>
            <Typography variant="h6" color={damage > 0 ? 'error.main' : 'text.secondary'}>
              {damage > 0 ? t('damage-points', { count: damage }) : t('no-damage')}
            </Typography>
            {criticalDamage > 0 && hitDamage > 0 && (
              <Typography variant="caption" color="text.secondary" component="div">
                {t('damage-composition', { hit: hitDamage, criticals: criticalDamage })}
              </Typography>
            )}
          </Box>
        )}
        {!fumble && hp && hpBefore !== undefined && hpAfter !== undefined && damage > 0 && (
          <Box sx={{ maxWidth: 360 }}>
            <Typography variant="caption" color="text.secondary" component="div">
              {t('hit-points-before-after', { before: hpBefore, after: hpAfter, max: hp.max })}
            </Typography>
            <LinearProgress
              variant="buffer"
              value={Math.max(0, (hpAfter / hp.max) * 100)}
              valueBuffer={Math.max(0, (hpBefore / hp.max) * 100)}
              color={hpAfter <= 0 ? 'error' : 'primary'}
              sx={{ height: 6, borderRadius: 3, mt: 0.5, '& .MuiLinearProgress-dashed': { display: 'none' } }}
            />
          </Box>
        )}
        <EffectList effects={fumble ? (fumble.effects ?? []) : effects} size="medium" />
        {withTexts &&
          texts.map((text, index) => (
            <Typography key={index} variant="body2">
              {text}
            </Typography>
          ))}
      </Stack>
    </Panel>
  );
};
