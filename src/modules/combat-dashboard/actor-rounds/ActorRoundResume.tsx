import React, { FC, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Box, ButtonBase, Stack, Tooltip, Typography } from '@mui/material';
import { Character, effectColor, effectIcon, ResourceBar, StatusBadge } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { actorRoundBleeding, actorRoundDownState } from '../../services/actor-round-service';
import { apModifierLabel, apTotals } from '../../services/ap-service';
import { useFactionColor } from '../../services/faction-colors';
import ActorRoundAvatar from '../../shared/avatars/ActorRoundAvatar';

/**
 * Actor cell of the board: a large miniature beside the name, a compact "down" badge (dead with the name struck
 * through and the miniature greyed, or unconscious; both in the color the effects use), profession and level,
 * faction (with its color dot), and hit point and fatigue bars. `extra` adds content below (the effects, when the
 * board has no effects column).
 */
const ActorRoundResume: FC<{
  actorRound: ActorRound;
  onActorRoundView: (actorRound: ActorRound) => void;
  selected?: boolean;
  extra?: ReactNode;
}> = ({ actorRound, onActorRoundView, selected = false, extra }) => {
  const { t } = useTranslation();
  const { characters, factions } = useContext(CombatContext)!;
  const factionColor = useFactionColor();
  const character = characters?.find((c: Character) => c.id === actorRound.actorId);
  const faction = factions?.find((f) => f.id === actorRound.factionId);
  const color = factionColor(actorRound.factionId);
  const down = actorRoundDownState(actorRound);
  const bleeding = down === 'dead' ? 0 : actorRoundBleeding(actorRound);
  const ap = apTotals(actorRound);
  const apModifiers = actorRound.apModifiers ?? [];
  // Breakdown of the capacity: 4 base AP and the modifiers of the effects (Haste +2, Staggered −1...).
  const apBreakdown = (
    <Stack>
      <span>{t('ap-base-n', { count: 4 })}</span>
      {apModifiers.map((modifier, index) => (
        <span key={`${modifier.source}-${index}`}>{apModifierLabel(modifier, t)}</span>
      ))}
    </Stack>
  );

  return (
    <Stack sx={{ height: '100%', gap: 1, p: 1.25 }}>
      <ButtonBase
        onClick={() => onActorRoundView(actorRound)}
        aria-pressed={selected}
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          gap: 1.25,
          textAlign: 'left',
          borderRadius: 1,
          width: '100%',
        }}
      >
        {/* The miniature takes the height of the name, faction and bars: players find their figure by it. */}
        <ActorRoundAvatar actorRound={actorRound} size={112} variant="rounded" dead={down === 'dead'} />
        <Stack sx={{ flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 0.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  flex: 1,
                  minWidth: 0,
                  textDecoration: down === 'dead' ? 'line-through' : undefined,
                }}
                color={down ? 'text.secondary' : 'text.primary'}
                noWrap
              >
                {actorRound.actorName}
              </Typography>
              {/* Active bleeding (spec 013): hit points lost every round until it is treated. */}
              {bleeding > 0 && (
                <Tooltip title={t('injury-bleeding-per-round', { value: bleeding })}>
                  <WaterDropIcon
                    fontSize="small"
                    color="error"
                    aria-label={t('injury-bleeding-per-round', { value: bleeding })}
                  />
                </Tooltip>
              )}
              {down && (
                // Icon only: the name needs the width, and the effects (beside or below) spell the state out.
                <StatusBadge
                  status={down}
                  label={t(down)}
                  abbr=""
                  detail={t(`effect-${down}-help`, { defaultValue: '' }) || undefined}
                  color={effectColor(down)}
                  avatar={effectIcon(down)}
                />
              )}
            </Stack>
            {character && (
              <Typography variant="caption" color="text.secondary" component="div" noWrap>
                {t('profession-level', {
                  profession: t(character.info.professionId),
                  level: character.experience.level,
                })}
              </Typography>
            )}
            {faction && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {faction.name}
                </Typography>
              </Stack>
            )}
          </Box>
          <Stack spacing={0.25}>
            <ResourceBar label={t('hp')} current={actorRound.hp.current} max={actorRound.hp.max} kind="hp" dense />
            <ResourceBar
              label={t('fatigue')}
              current={Math.round(actorRound.fatigue.accumulator)}
              max={100}
              kind="fatigue"
              valueLabel={`${Math.round(actorRound.fatigue.accumulator)}%`}
              dense
            />
            <Tooltip title={apBreakdown}>
              <Typography
                variant="caption"
                color={apModifiers.length > 0 ? 'text.primary' : 'text.secondary'}
                sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                aria-label={t('ap-spent-of-capacity', { spent: ap.spent, capacity: ap.capacity })}
              >
                {`${t('action-points-short')} ${ap.spent}/${ap.capacity}`}
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>
      </ButtonBase>
      {extra}
    </Stack>
  );
};

export default ActorRoundResume;
