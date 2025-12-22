import React, { FC } from 'react';
import { Typography } from '@mui/material';
import { t } from 'i18next';
import { ActionAttack } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';

const AttackTitle: FC<{
  attack: ActionAttack;
  target: ActorRound;
}> = ({ attack, target }) => {
  if (!attack || !target) return <div>Loading...</div>;

  const getFormattedArmor = (): string => {
    if (!target || !target.defense) return '';
    if (target.defense.at !== undefined && target.defense.at !== null) return String(target.defense.at);
    return `${target.defense.headAt} / ${target.defense.bodyAt} / ${target.defense.armsAt} / ${target.defense.legsAt}`;
  };

  const getAttackDetail = (): string => {
    return `${t('bo')}: ${attack.modifiers.bo}  •  BD: ${target.defense.bd}  •  Armor: ${getFormattedArmor()}`;
  };

  return (
    <>
      <Typography variant="h6" color="primary">
        {`${t(attack.modifiers.attackName)} → ${target?.actorName}`}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {getAttackDetail()}
      </Typography>
    </>
  );
};

export default AttackTitle;
