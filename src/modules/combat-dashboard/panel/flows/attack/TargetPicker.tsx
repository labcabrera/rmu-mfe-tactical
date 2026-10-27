import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { CharacterPicker } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { useActorRoundOption } from '../../../../services/actor-round-option';

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

/** DB, AT and hit points of a target, on the right of its card. */
const TargetStats: FC<{ target: ActorRound }> = ({ target }) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={1}>
      <Stat label={t('bd')} value={target.defense.bd} />
      <Stat label={t('at-short')} value={armor(target)} />
      <Stat label={t('hp')} value={`${target.hp.current}/${target.hp.max}`} />
    </Stack>
  );
};

/**
 * Inline target choice (spec 038): the actors of the other factions (or everyone, with the switch) as cards with
 * their DB, AT and hit points. Once a target is chosen it collapses to that card with a "change" button.
 */
const TargetPicker: FC<{
  sourceActorRound: ActorRound;
  value: string;
  onChange: (targetId: string) => void;
}> = ({ sourceActorRound, value, onChange }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const toOption = useActorRoundOption();
  const rounds = actorRounds ?? [];
  return (
    <CharacterPicker
      label={t('target')}
      options={rounds.map((actorRound) => toOption(actorRound))}
      relation="enemies"
      factionId={sourceActorRound.factionId}
      exclude={[sourceActorRound.actorId]}
      allowShowAll
      variant="cards"
      renderDetails={(option) => {
        const target = rounds.find((actorRound) => actorRound.actorId === option.id);
        return target && <TargetStats target={target} />;
      }}
      value={value || null}
      onChange={(id) => id && onChange(id)}
    />
  );
};

export default TargetPicker;
