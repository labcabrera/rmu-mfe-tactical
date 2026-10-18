import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Button, ButtonBase, Chip, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { CombatContext } from '../../../../../CombatContext';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { isActorRoundDisabled, isActorRoundProne, isActorRoundStunned } from '../../../../services/actor-round-service';
import { useFactionColor } from '../../../../services/faction-colors';
import ActorRoundAvatar from '../../../../shared/avatars/ActorRoundAvatar';

const armor = (target: ActorRound) =>
  target.defense.at ??
  [target.defense.headAt, target.defense.bodyAt, target.defense.armsAt, target.defense.legsAt].join('/');

const Stat: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Box sx={{ textAlign: 'center', minWidth: 40 }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

/** One actor as a target card: faction stripe, miniature, name and state, and its DB, AT and hit points. */
export const TargetRow: FC<{ target: ActorRound; selected?: boolean; onClick?: () => void }> = ({
  target,
  selected = false,
  onClick,
}) => {
  const { t } = useTranslation();
  const factionColor = useFactionColor();
  const states = [
    isActorRoundDisabled(target) && t('down'),
    isActorRoundProne(target) && t('prone'),
    isActorRoundStunned(target) && t('stunned'),
  ].filter(Boolean) as string[];
  const content = (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}>
      <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 1, bgcolor: factionColor(target.factionId) }} />
      <ActorRoundAvatar actorRound={target} size={56} variant="rounded" />
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
          {target.actorName}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
          {states.map((state) => (
            <Chip key={state} size="small" color="warning" label={state} />
          ))}
        </Stack>
      </Box>
      <Stack direction="row" spacing={1}>
        <Stat label={t('bd')} value={target.defense.bd} />
        <Stat label={t('at-short')} value={armor(target)} />
        <Stat label={t('hp')} value={`${target.hp.current}/${target.hp.max}`} />
      </Stack>
    </Stack>
  );
  if (!onClick) return <Box sx={{ px: 1.25, py: 1 }}>{content}</Box>;
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        px: 1.25,
        py: 1,
        borderRadius: `${theme.radius.sm}px`,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'background.light',
      })}
    >
      {content}
    </ButtonBase>
  );
};

/**
 * Inline target choice: the actors of the other factions (or everyone), as rows. Once a target is chosen it
 * collapses to that row with a "change" button.
 */
const TargetPicker: FC<{
  sourceActorRound: ActorRound;
  value: string;
  onChange: (targetId: string) => void;
}> = ({ sourceActorRound, value, onChange }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const [all, setAll] = useState(false);
  const [changing, setChanging] = useState(!value);
  const selected = actorRounds?.find((ar) => ar.actorId === value);

  if (selected && !changing) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TargetRow target={selected} />
        </Box>
        <Button size="small" onClick={() => setChanging(true)}>
          {t('change')}
        </Button>
      </Stack>
    );
  }

  const candidates = (actorRounds ?? []).filter(
    (ar) => ar.actorId !== sourceActorRound.actorId && (all || ar.factionId !== sourceActorRound.factionId)
  );
  return (
    <Stack spacing={1} role="radiogroup" aria-label={t('target')}>
      <FormControlLabel
        control={<Switch size="small" checked={all} onChange={(e) => setAll(e.target.checked)} />}
        label={<Typography variant="caption">{t('show-all-actors')}</Typography>}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1 }}>
        {candidates.map((target) => (
          <TargetRow
            key={target.actorId}
            target={target}
            selected={target.actorId === value}
            onClick={() => {
              onChange(target.actorId);
              setChanging(false);
            }}
          />
        ))}
      </Box>
    </Stack>
  );
};

export default TargetPicker;
