import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterPicker } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { useActorRoundOption } from '../../../../services/actor-round-option';
import { frenzyLevel } from '../../../../services/frenzy-service';

const armor = (target: ActorRound) =>
  target.defense.at ??
  [target.defense.headAt, target.defense.bodyAt, target.defense.armsAt, target.defense.legsAt].join('/');

/** "DB 18 · AT 8 · HP 74/74": one line under the name, so that it never hides it (workspace spec 085, 2.1). */
export const targetStatsLine = (target: ActorRound, t: (key: string) => string) =>
  [
    `${t('bd')} ${target.defense.bd}`,
    `${t('at-short')} ${armor(target)}`,
    `${t('hp-short')} ${target.hp.current}/${target.hp.max}`,
  ].join(' · ');

/**
 * Inline target choice (spec 038): the actors of the other factions (or everyone, with the switch) as cards with
 * their DB, AT and hit points under the name. Once a target is chosen it collapses to that card with a "change" button. An attacker
 * in frenzy sees everyone (spec 040, decision 15): it attacks the nearest creature, friend or foe.
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
      options={rounds.map((actorRound) => toOption(actorRound, { secondary: targetStatsLine(actorRound, t) }))}
      relation={frenzyLevel(sourceActorRound) > 0 ? 'all' : 'enemies'}
      factionId={sourceActorRound.factionId}
      exclude={[sourceActorRound.actorId]}
      allowShowAll
      variant="cards"
      value={value || null}
      onChange={(id) => id && onChange(id)}
    />
  );
};

export default TargetPicker;
