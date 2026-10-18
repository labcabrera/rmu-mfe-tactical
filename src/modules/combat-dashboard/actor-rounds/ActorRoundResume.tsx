import React, { FC, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import { Character, ResourceBar } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useFactionColor } from '../../services/faction-colors';
import ActorRoundAvatar from '../../shared/avatars/ActorRoundAvatar';

const isDown = (actorRound: ActorRound) =>
  actorRound.effects.find((e) => e.status === 'dead' || e.status === 'unconcious')?.status;

/**
 * Actor cell of the board: a large miniature (with a ring in the faction color) beside the name, a "down"
 * chip, profession and level, faction (with its color dot), and hit point and fatigue bars. `extra` adds
 * content below (the effects, when the board has no effects column).
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
  const down = isDown(actorRound);

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
        <ActorRoundAvatar actorRound={actorRound} size={96} variant="rounded" ringColor={color} dead={!!down} />
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
              {down && <Chip size="small" color="error" label={t(down)} />}
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
          </Stack>
        </Stack>
      </ButtonBase>
      {extra}
    </Stack>
  );
};

export default ActorRoundResume;
