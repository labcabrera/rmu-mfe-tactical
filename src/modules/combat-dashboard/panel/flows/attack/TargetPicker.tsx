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

/** One actor as a target: miniature, name, DB, AT, hit points and state. */
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
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}>
      <ActorRoundAvatar actorRound={target} size={40} variant="rounded" ringColor={factionColor(target.factionId)} />
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {target.actorName}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {`${t('bd')} ${target.defense.bd} · ${t('at')} ${armor(target)} · ${t('hp')} ${target.hp.current}/${target.hp.max}`}
        </Typography>
      </Box>
      {states.map((state) => (
        <Chip key={state} size="small" color="warning" variant="outlined" label={state} />
      ))}
    </Stack>
  );
  if (!onClick) return <Box sx={{ px: 1, py: 0.75 }}>{content}</Box>;
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        px: 1,
        py: 0.75,
        borderRadius: `${theme.radius.sm}px`,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
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
    <Stack spacing={0.75} role="radiogroup" aria-label={t('target')}>
      <FormControlLabel
        control={<Switch size="small" checked={all} onChange={(e) => setAll(e.target.checked)} />}
        label={<Typography variant="caption">{t('show-all-actors')}</Typography>}
      />
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
    </Stack>
  );
};

export default TargetPicker;
